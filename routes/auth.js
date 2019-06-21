'use strict'
const mysql = require('promise-mysql')
const bcrypt = require('bcrypt')
const Router = require('koa-router')
const parser = require('koa-body')
const passport = require('koa-passport')
const router = new Router({ prefix: '/api/auth' })
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

    await conn.query({
      sql: 'INSERT INTO users (username, hash, salt) VALUES (?, ?, ?)',
      values: [body.username, hash, salt]
    })
    conn.end()

    return passport.authenticate('local', (err, user) => {
      if (err) {
        ctx.status = 500
        return
      }

      if (user) {
        ctx.login(user)
        ctx.status = 201
        ctx.body = '/todo'
      } else {
        ctx.status = 400
      }
    })(ctx)
  } catch (err) {
    console.log(err)
    ctx.status = 500
  }
})

router.post('/login', parser(), async ctx => {
  return passport.authenticate('local', (err, user) => {
    if (err) {
      ctx.status = 500
      return
    }

    if (user) {
      ctx.login(user)
      ctx.body = '/todo'
    } else {
      ctx.status = 400
      ctx.body = '/'
    }
  })(ctx)
})

router.get('/logout', async ctx => {
  if (ctx.isAuthenticated) {
    ctx.logout()
    ctx.redirect('/')
  } else {
    ctx.status = 401
  }
})

module.exports = router.routes()
