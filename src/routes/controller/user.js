const ApiErr = require('../../error/apiError');
const ApiErrName = require('../../error/apiErrorNames');
const util = require('../../lib/util');
const UserSer = require('../../service/user');
const Token = require('../../service/token');
const pwdHash = require('../../lib/pswdhash')

exports.register = async (ctx) => {
  const { email, password } = ctx.request.body;
  // check params
  if (!email || !password) {
    throw new ApiErr(ApiErrName.missRegisterParms);
  }
  // check email
  if (!util.checkEmail(email)) {
    throw new ApiErr(ApiErrName.invalidMail);
  }
  const userOrm = ctx.orm.models.User;
  let result;
  try {
    result = await userOrm.create({ name: email, password: pwdHash(password) })
  } catch (error) {
    throw new ApiErr(ApiErrName.mailExisted);
  }
  return ctx.body = {
    token: Token.encode(
      result.id,
      result.role,
    )
  }
};

exports.createManager = async (ctx) => {
  // 确认超级用户权限
  UserSer.checkAuth('root', ctx.role);
  const { name, password } = ctx.request.body;
  // check params
  if (!name || !password) {
    throw new ApiErr(ApiErrName.missCreateManagerParms);
  }

  // check existed
  const userSer = new UserSer(ctx.orm);
  try {
    result = await userSer.orm.create({ name, password: pwdHash(password) })
  } catch (error) {
    throw new ApiErr(ApiErrName.mailExisted);
  }
  return ctx.body = { name, password }
};//

exports.deleteManager = async (ctx) => {
  // 确认超级用户权限
  UserSer.checkAuth('root', ctx.role);
  const { name } = ctx.request.body;
  // check params
  if (!name || !password) {
    throw new ApiErr(ApiErrName.missRegisterParms);
  }

  // check existed
  const userSer = new UserSer(ctx.orm);
  try {
    result = await userSer.orm.create({ name, password: pwdHash(password) })
  } catch (error) {
    throw new ApiErr(ApiErrName.mailExisted);
  }
  return ctx.body = { name, password }
};


exports.login = async (ctx) => {
  const { email, password } = ctx.request.body;
  // check params
  if (!email || !password) {
    throw new ApiErr(ApiErrName.missLoginParms);
  }
  const userSer = new UserSer(ctx.orm);
  const result = await userSer.findOne({ name: email, password: pwdHash(password) });
  if (result) {
    return ctx.body = {
      token: Token.encode(
        result.id,
        result.role,
      )
    }
  } else {
    throw new ApiErr(ApiErrName.invalidLoginParms);
  }
};