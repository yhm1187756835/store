const Koa = require('koa')
const app = new Koa()
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')

const logUtil = require('./lib/log');
const resFormat=require('./lib/resFormat');
const index = require('./routes/index')
const users = require('./routes/users')

//  error handler
onerror(app)
//  middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())

app.use(require('koa-static')(__dirname + '/public'))

//  logger
app.use(async (ctx, next) => {
  // 响应开始时间
  const start = new Date();
  // 响应间隔时间
  let ms;
  try {
    // 开始进入到下一个中间件
    await next();

    ms = new Date() - start;
    // 记录响应日志
    logUtil.logResponse(ctx, ms);
  } catch (error) {
    ms = new Date() - start;
    // 记录异常日志
    logUtil.logError(ctx, error, ms);
  }

});

// 格式化相应
app.use(resFormat())

//  routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())

//  error-handling
app.on('error', (err, ctx) => {
  err.MSG='server error!'
  logUtil.logError(ctx, err)
});

module.exports = app
