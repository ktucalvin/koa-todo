'use strict'
const crypto = require('crypto')
const path = require('path')
const mysql = require('promise-mysql')
const bcrypt = require('bcrypt')
const pug = require('pug')
const Router = require('koa-router')
const parser = require('koa-body')
const jwt = require('jsonwebtoken')
const router = new Router({ prefix: '/api/auth' })
const renderTasks = pug.compileFile(path.join(__dirname, '../views/todo.pug'))
const dbOptions = {
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'koa_todo'
}

router.post('/register', parser(), async ctx => {
  const body = ctx.request.body
  if (!body.username || !body.password) {
    ctx.status = 400
    return
  }

  try {
    const salt = await bcrypt.genSalt(16)
    const hash = await bcrypt.hash(body.password, salt)
    const conn = await mysql.createConnection(dbOptions)
    const usernameTaken = await conn.query({
      sql: 'SELECT * FROM users WHERE username=?',
      values: [body.username]
    })
    if (usernameTaken[0]) {
      ctx.status = 403
      ctx.body = 'Username has already been taken'
      return
    }

    const res = await conn.query({
      sql: 'INSERT INTO users (username, hash, salt) VALUES (?, ?, ?)',
      values: [body.username, hash, salt]
    })
    conn.end()

    ctx.status = 201
    ctx.body = renderTasks({ todos: [] })
    ctx.cookies.set('koatodo_auth',
      jwt.sign({
        id: res.insertId,
        jti: crypto.randomBytes(20).toString('base64')
      }, process.env.JWT_KEY, { expiresIn: '12h' }))
  } catch (err) {
    console.log(err)
    ctx.status = 500
  }
})

router.post('/login', parser(), async ctx => {
  const body = ctx.request.body
  if (!body.username || !body.password) {
    ctx.status = 400
    return
  }

  try {
    const conn = await mysql.createConnection(dbOptions)
    const user = await conn.query({
      sql: 'SELECT * FROM users WHERE username=?',
      values: [body.username]
    })

    if (!user[0]) {
      ctx.status = 403
      ctx.body = 'Invalid credentials'
      return
    }

    const match = await bcrypt.compare(body.password, user[0].hash)
    if (!match) {
      ctx.status = 403
      ctx.body = 'Invalid credentials'
      return
    }

    ctx.status = 200
    const todos = await conn.query({
      sql: 'SELECT id, task FROM tasks WHERE user_id=?',
      values: [user[0].id]
    })
    conn.end()

    ctx.body = renderTasks({ todos })
    ctx.cookies.set('koatodo_auth',
      jwt.sign({
        id: user[0].id,
        jti: crypto.randomBytes(20).toString('base64')
      }, process.env.JWT_KEY, { expiresIn: '12h' }))
  } catch (err) {
    console.log(err)
    ctx.status = 500
  }
})

router.post('/logout', parser(), async ctx => {
  try {
    await jwt.verify(ctx.cookies.get('koatodo_auth'), process.env.JWT_KEY)
    ctx.cookies.set('koatodo_auth')
    ctx.status = 200
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      ctx.status = 403
      ctx.body = 'Token is invalid'
    } else {
      console.log(err)
      ctx.status = 500
    }
  }
})

module.exports = router.routes()
