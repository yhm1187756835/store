const router = require('koa-router')()
const config=require('config')

router.prefix('/users')

router.get('/', function (ctx, next) {
  console.log('+++config');
  console.log(config)
  ctx.body = 'this is a users response!'
})

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})

module.exports = router
