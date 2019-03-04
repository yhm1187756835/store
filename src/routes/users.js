const router = require('koa-router')()
const userContr=require('./controller/user')
router.prefix('/users')

router.post('/register',userContr.register)

router.get('/bar', function (ctx, next) {
    ctx.body = 'this is a users/bar response'
})

module.exports = router
