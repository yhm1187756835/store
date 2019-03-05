const Koa = require('koa')
const app = new Koa()
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const { database } = require('config')

const sequelize = require('./model/index')
const logUtil = require('./lib/log')
const resFormat = require('./lib/resFormat')
const index = require('./routes/index')
const users = require('./routes/users')
const goods = require('./routes/goods')
const logMiddle=require('./middleware/log');

//  error handler
onerror(app)
sequelize(database).then((orm) => { app.context.orm = orm });
//  middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(require('koa-static')(__dirname + '/public'))

//  logger
app.use(logMiddle);
// 格式化相应
app.use(resFormat())

//  routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(goods.routes(), goods.allowedMethods())
//  error-handling
app.on('error', (err, ctx) => {
  err.message = 'server error!' + err.message
  logUtil.logError(ctx, err)
});

module.exports = app
