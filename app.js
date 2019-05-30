'use strict'
require('dotenv').config()
const https = require('https')
const Koa = require('koa')
const serve = require('koa-static')
const jwt = require('koa-jwt')
const app = new Koa()

const certopts = {
  key: process.env.SSL_KEY,
  cert: process.env.SSL_CERT
}

app.use(serve('./public'))

app.use(require('./routes/auth'))

app.use(jwt({ secret: process.env.JWT_KEY, cookie: 'koatodo_auth' }))

app.use(require('./routes/todo'))

app.use(serve('./protected', { extensions: ['.html'] }))

https.createServer(certopts, app.callback())
  .listen(443, () => console.log('Server running at https://localhost/#/'))
