const ApiErr = require('../../error/apiError');
const ApiErrName = require('../../error/apiErrorNames');
const GoodsSer = require('../../service/goods');

exports.create = async (ctx) => {
  const { name, price, count } = ctx.request.body;
  // check params
  if (!name || !price || !count) {
    throw new ApiErr(ApiErrName.missGoodsParam);
  }
  // check existed
  const goodsSer = new GoodsSer(ctx.orm);
  const goodsDb = await goodsSer.orm.findOne({ where: { name } });
  if (goodsDb) {
    throw new ApiErr(ApiErrName.goodExisted);
  }
  try {
    await goodsSer.insert(name, price, count, ctx.role);
  } catch (error) {
    throw new ApiErr(ApiErrName.invalidGoodsParam);
  }
};

exports.put = async (ctx) => {
  const { goodsId, count } = ctx.request.body;
  // check params
  if (!goodsId || !count) {
    throw new ApiErr(ApiErrName.missGoodsParam);
  }
  // check goods existed
  const goodsSer = new GoodsSer(ctx.orm);
  await goodsSer.put(goodsId, count, ctx.role);
};




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