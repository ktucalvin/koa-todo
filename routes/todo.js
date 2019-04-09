'use strict'
const crypto = require('crypto')
const Router = require('koa-router')
const parser = require('koa-body')
const router = new Router({ prefix: '/todo' })
const todos = new Map()

router.delete('/delete/:id', parser(), (ctx, next) => {
  if (todos.has(ctx.params.id)) {
    todos.delete(ctx.params.id)
    ctx.status = 200
  } else {
    ctx.status = 404
  }
})

router.patch('/edit/:id', parser(), (ctx, next) => {
  const body = ctx.request.body
  const todo = todos.get(ctx.params.id)
  if (!todo) {
    ctx.status = 404
    return
  }
  if (body.task) {
    todo.task = body.task
  }
  ctx.status = 204
})

router.post('/create', parser(), (ctx, next) => {
  const task = ctx.request.body.task
  if (task) {
    const id = crypto.randomBytes(20).toString('hex')
    todos.set(id, { task })
    ctx.status = 201
    ctx.body = id
  } else {
    ctx.status = 400
  }
})

router.get('/all', (ctx, next) => {
  if (!todos.size) {
    ctx.body = '{}'
    return
  }
  let str = '{'
  for (const entry of todos.entries()) {
    str += `"${entry[0]}" : ${JSON.stringify(entry[1])},`
  }
  str = str.slice(0, -1)
  str += '}'
  ctx.body = str
})

module.exports = router.routes()
