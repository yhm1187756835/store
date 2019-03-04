const DatabaseServiceBase = require("./database");

/**
 * 商品服务
 */
module.exports = class extends DatabaseServiceBase {
  /**
   * 发起提币请求
   * @param {Integer} userId 用户ID
   * @param {Integer} coinId 币种ID
   * @param {Integer} amount 提币数量
   * @param {String} address 地址信息
   */
  async pullCoin(userId, coinId, amount, address) {
    await this.execTransaction(async (transaction) => {
      // 1. 冻结用户资源
      const res = await this.getUserResource(userId, coinId, transaction);
      this.lockUserResource(res, amount);
      await res.save({ transaction });
      // 2. 创建提币记录
      await this.rechargeDb.create(
        {
          userId,
          coinId,
          value: amount,
          address: address,
          type: "pull",
          status: "pending",
        },
        { transaction },
      );
    });
  }

  /**
   * 取消提币请求
   * @param {Integer} userId 用户ID
   * @param {Integer} rechargeId 提币记录ID
   */
  async cancelPull(userId, rechargeId) {
    await this.execTransaction(async (transaction) => {
      // 1. 检测提币记录是否正常
      const rec = await this.getUserRecharge(rechargeId, transaction);
      if (
        rec.getDataValue("userId") !== userId ||
        rec.getDataValue("status") !== "pending" ||
        rec.getDataValue("type") !== "pull"
      ) {
        throw new Error("错误的记录");
      }

      // 2. 将提币记录转为取消状态
      rec.setDataValue("status", "cancel");
      await rec.save({ transaction });

      // 3. 将用户资源从冻结转换为可用
      const res = await this.getUserResource(
        userId,
        rec.getDataValue("coinId"),
        transaction,
      );
      this.unlockUserResource(res, rec.getDataValue("value"));
      await res.save({ transaction });
    });
  }

  /**
   * 放行冲提币 给后台管理使用
   * @param {Integer} rechargeId 重提记录
   */
  async allowRecharge(rechargeId) {
    await this.execTransaction(async (transaction) => {
      // 1. 检测充提记录
      const rec = await this.rechargeDb.findByPk(rechargeId, { transaction });
      if (!rec || rec.getDataValue("status") !== "pending") {
        throw new Error("系统错误: 错误的充提记录");
      }
      const value = rec.getDataValue("value");
      if (!value || value <= 0) {
        throw new Error("系统错误: 错误的充提记录");
      }
      const type = rec.getDataValue("type");
      rec.setDataValue("status", "success");
      await rec.save({ transaction });
      // 2. 对用户资金进行冻结或者解冻操作
      const res = await this.getUserResource(
        rec.getDataValue("userId"),
        rec.getDataValue("coinId"),
        transaction,
      );
      if (type === "pull") {
        // 提币 放行后管理员应该转币 所以这里直接减少冻结金额
        if (res.getDataValue("freeze") < value) {
          throw new Error("系统错误: 冻结金额不足");
        }
        res.setDataValue("freeze", res.getDataValue("freeze") - value);
      } else {
        // 充币 放行后应该解冻对应的资金
        this.unlockUserResource(res, rec.getDataValue("value"));
      }
      await res.save({ transaction });
    });
  }

  /**
   * 添加充币请求(这个给区块链监视程序使用)
   * @param {Integer} userId 用户ID
   * @param {Integer} coinId 币种ID
   * @param {Integer} amount 提币数量
   * @param {String} address 地址信息
   */
  async pushCoin(userId, coinId, amount, address) {
    await this.execTransaction(async (transaction) => {
      // 1. 给用户添加冻结资源
      const res = await this.getUserResource(userId, coinId, transaction);
      res.setDataValue("freeze", res.getDataValue("freeze") + amount);
      await res.save({ transaction });
      // 2. 创建充币记录待批准
      await this.rechargeDb.create(
        {
          userId,
          coinId,
          value: amount,
          address: address,
          type: "push",
          status: "pending",
        },
        { transaction },
      );
    });
  }
};
