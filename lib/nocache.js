'use strict'

module.exports =
async function nocache (ctx, next) {
  ctx.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
  ctx.set('Expires', '-1')
  ctx.set('Pragma', 'no-cache')
  await next()
}
