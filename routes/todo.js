'use strict'
const Router = require('koa-router')
const parser = require('koa-body')
const mysql = require('promise-mysql')
const router = new Router({ prefix: '/todo' })
const dbOptions = {
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'koa_todo'
}

router.get('/list', parser(), async ctx => {
  const conn = await mysql.createConnection(dbOptions)
  const result = await conn.query({
    sql: 'SELECT * FROM tasks WHERE user_id=?',
    values: [ctx.state.user.id]
  })
  ctx.status = 200
  ctx.body = result
})

router.delete('/delete/:id', parser(), async ctx => {
  const conn = await mysql.createConnection(dbOptions)
  const result = await conn.query({
    sql: 'DELETE FROM tasks WHERE id=? AND user_id=?',
    values: [ctx.params.id, ctx.state.user.id]
  })
  ctx.status = result.affectedRows ? 200 : 404
})

router.patch('/edit/:id', parser(), async ctx => {
  const body = ctx.request.body
  const conn = await mysql.createConnection(dbOptions)
  const result = await conn.query({
    sql: 'UPDATE tasks SET task=? WHERE id=? AND user_id=?',
    values: [body.task, ctx.params.id, ctx.state.user.id]
  })
  ctx.status = result.affectedRows ? 204 : 404
})

router.post('/create', parser(), async ctx => {
  const task = ctx.request.body.task
  if (!task) {
    ctx.status = 400
    return
  }
  const conn = await mysql.createConnection(dbOptions)
  const result = await conn.query({
    sql: 'INSERT INTO tasks (user_id, task, priority, endtime) VALUES (?, ?, ?, ?)',
    values: [ctx.state.user.id, task, 1, ctx.request.body.endtime]
  })
  ctx.status = 201
  ctx.body = result.insertId
})

module.exports = router.routes()
