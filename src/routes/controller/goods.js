const ApiErr = require('../../error/apiError');
const ApiErrName = require('../../error/apiErrorNames');
const GoodsSer = require('../../service/goods');

exports.create = async (ctx) => {
  const { name, price, count } = ctx.request.body;
  // check params
  if (!name || !price || !count) {
    throw new ApiErr(ApiErrName.missGoodsParam);
  }
  try {
    const goodsSer = new GoodsSer(ctx.orm);
    await goodsSer.insert(name, price, count);
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
  try {
    const goodsSer = new GoodsSer(ctx.orm);
    await goodsSer.put(goodsId,count)
  } catch (error) {
    throw new ApiErr(ApiErrName.invalidGoodsParam);
  }
};