
module.exports = (sequelize, types) => {
  const Order = sequelize.define("Order", {
    quantity: {
      type: types.BIGINT.UNSIGNED,
      allowNull: false,
      comment:
        "购买商品数量",
    },
    status: {
      type: types.ENUM("pending", "failed", "success"), // eslint-disable-line new-cap
      defaultValue: "pending",
      comment:
        "当前状态 pending正在进行交易 failed交易失败 success已经完全成功的交易",
    },
  });
  return Order;
};
