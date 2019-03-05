const router = require('koa-router')()
const goodsContr=require('./controller/goods')
const token=require('../middleware/token');

router.prefix('/goods')
router.post('/create',token.checkLogin,goodsContr.create)
router.put('/put',token.checkLogin, goodsContr.put)

module.exports = router
