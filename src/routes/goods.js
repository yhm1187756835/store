const router = require('koa-router')()
const goodsContr=require('./controller/goods')

router.prefix('/goods')
router.post('/create',goodsContr.create)
router.post('/put', goodsContr.put)

module.exports = router
