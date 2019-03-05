
const Token = require('../service/token')
const ApiErr = require('../error/apiError');
const ApiErrName = require('../error/apiErrorNames');

module.exports.checkLogin =  async function(ctx, next) {
    const token = new Token(ctx.header['accesstoken']);
    ctx.role = token.role;
    if (!ctx.role) {
      throw new ApiErr(ApiErrName.missLogin)
    }
    await next();
  }