'use strict'

module.exports =
async function rejectUnauthorized (ctx, next) {
  ctx.isAuthenticated() ? await next() : ctx.status = 401
}
