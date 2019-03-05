const router = require('koa-router')()
const userContr=require('./controller/user')
const token=require('../middleware/token');

router.prefix('/users')

router.post('/register',userContr.register)
router.post('/createManager',token.checkLogin,userContr.createManager)
router.delete('/deleteManager',token.checkLogin,userContr.deleteManager)
router.get('/login', userContr.login)

module.exports = router
