'use strict'
const bcrypt = require('bcrypt')
const passport = require('koa-passport')
const { Strategy: LocalStrategy } = require('passport-local')
const mysql = require('promise-mysql')
const dbOptions = {
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'koa_todo'
}

passport.serializeUser((user, done) => done(null, user[0].id))

passport.deserializeUser(async (id, done) => {
  try {
    const conn = await mysql.createConnection(dbOptions)
    const rawUser = await conn.query({
      sql: 'SELECT * FROM users WHERE id=?',
      values: [id]
    })

    const user = {
      id: rawUser[0].id,
      username: rawUser[0].username
    }

    done(null, user)
  } catch (err) {
    done(err)
  }
})

passport.use(new LocalStrategy(async (username, password, done) => {
  const conn = await mysql.createConnection(dbOptions)
  const user = await conn.query({
    sql: 'SELECT * FROM users WHERE username=?',
    values: [username]
  })

  const match = await bcrypt.compare(password, user[0].hash)
  match ? done(null, user) : done(null, false)
}))
