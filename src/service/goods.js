const DatabaseServiceBase = require("./database");
const userSer = require('./user');
const ApiErr = require('../error/apiError');
const ApiErrName = require('../error/apiErrorNames');

/**
 * 商品服务
 */
module.exports = class extends DatabaseServiceBase {

  /**
   * 构造函数
   * @param {Object} sequelize 
   */
  constructor(sequelize) {
    super(sequelize);
    this.orm = sequelize.models["Goods"];
  }
  /**
   *创建用户
   * @param {String} name 商品名
   * @param {String} price 价格
   * @param {String} stock 数量
   * @param {String} role 用户角色
   */
  async insert(name, price, stock, role) {
    const needAuth = 'manager';
    userSer.checkAuth(needAuth, role);
    return await this.orm.create({ name, price, stock });
  }
  /**
   * 补货
   * @param {Number} goodsId 商品id
   * @param {Number} count 补货数量
   * @param {String} role 用户角色
   */
  async put(goodsId, count, role) {
    const needAuth = 'manager';
    userSer.checkAuth(needAuth, role);
    await this.execTransaction(async (transaction) => {

      const goods = await this.orm.findOne({
        where: {
          id: goodsId,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!goods) {
        throw new ApiErr(ApiErrName.goodNoExisted);
      }
      goods.stock += Number(count);
      goods.stock = goods.stock < 0 ? 0 : goods.stock;
      await goods.save({ transaction });
    })
  }

};
