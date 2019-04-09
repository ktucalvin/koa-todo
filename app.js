'use strict'
require('dotenv').config()
const https = require('https')
const Koa = require('koa')
const Router = require('koa-router')
const serve = require('koa-static')
const app = new Koa()
const router = new Router()

const certopts = {
  key: process.env.SSL_KEY,
  cert: process.env.SSL_CERT
}

app.use(serve('./public'))

router.use(require('./routes/todo'))

app.use(router.routes())

https.createServer(certopts, app.callback()).listen(443, () => console.log('Server listening on port 443'))
