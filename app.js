'use strict'
require('dotenv').config()
const https = require('https')
const Koa = require('koa')
const serve = require('koa-static')
const session = require('koa-session')
const passport = require('koa-passport')
const app = new Koa()

const certopts = {
  key: process.env.SSL_KEY,
  cert: process.env.SSL_CERT
}

app.use(serve('./public'))

app.keys = [process.env.SESSIONS_KEY]
app.use(session(app))

require('./lib/passport-setup')
app.use(passport.initialize())
app.use(passport.session())

app.use(require('./routes/auth'))

app.use(require('./lib/reject-unauthorized'))

app.use(require('./routes/todo'))

app.use(require('./lib/nocache'))

app.use(serve('./protected', { extensions: ['.html'] }))

https.createServer(certopts, app.callback())
  .listen(443, () => console.log('Server running at https://localhost/#/'))
