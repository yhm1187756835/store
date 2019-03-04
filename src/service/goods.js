const DatabaseServiceBase = require("./database");

/**
 * 用户服务
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
   */
  async insert(name, price, stock) {
    return this.orm.create(
      {
        name,
        price,
        stock,
      }
    );
  }
  /**
   * 补货
   * @param {Number} goodsId 商品id
   * @param {Number} count 补货数量
   */
  async put(goodsId, count) {
    await this.execTransaction(async (transaction) => {

      const goods = await this.orm.findOne({
        where: {
          id: goodsId,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      goods.stock += Number(count);
      await goods.save({ transaction });

    })
  }

};
