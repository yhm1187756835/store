const { associateMany } = require("./util/associate");

module.exports = (sequelize, types) => {
  const Goods = sequelize.define("Goods", {
    name: {
      type: types.STRING,
      allowNull: false,
      unique: true,
      comment: "商品名称",
    },
    price: {
      type: types.DOUBLE,
      allowNull: false,
      comment: "商品价格",
    },
    stock: {
      type: types.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "商品库存",
    }
  });

  Goods.associate = function (models) {
    // 订单表 关联 商品标
    associateMany(Goods, models.Order, {
      foreignKey: {
        name: "goodsId",
        allowNull: false,
      },
      as: "goods",
    });
  };
  return Goods;
};
