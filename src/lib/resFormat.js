/**
 * 在app.use(router)之前调用
 */
const ApiError = require('../error/apiError');
const {debug}=require('config')
const responseFormatter = () => {
    return async (ctx, next) => {
        try {
            // 先去执行路由
            await next();
        } catch (error) {
            if (error instanceof ApiError) {
                ctx.status = 200;
                ctx.body = {
                    code: error.code,
                    message: error.message
                }
            }else{
                ctx.body = {
                    code: -1,
                    message:'服务器内部错误，请确认输入数据有效',
                }
            }
            if(debug){
             console.log(error)
            }
            // 继续抛，让外层中间件处理日志
            throw error;
           
        }
        if (ctx.body) {
            ctx.body = {
                code: 0,
                message: 'success',
                data: ctx.body
            }
        } else {
            ctx.body = {
                code: 0,
                message: 'success'
            }
        }
    }
}

module.exports = responseFormatter;