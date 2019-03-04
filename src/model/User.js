const { associateMany } = require("./util/associate");

module.exports = (sequelize, types) => {
  const User = sequelize.define("User", {
    name: {
      type: types.STRING,
      allowNull: false,
      comment: "用户名 普通用户要邮箱，其他角色不限",
      unique: true,
    },
    password: {
      type: "VARBINARY(32)",
      allowNull: false,
      comment: "用户密码的SHA256值",
    },
    role: {
      type: types.ENUM("root", "manager", "user"), // eslint-disable-line new-cap
      defaultValue: "user",
      comment: "用户类型(超级管理员root, 系统管理员manager, 用户user)",
    },
  });

  User.associate = function (models) {
    const keyRename = {
      foreignKey: {
        name: "userId",
        allowNull: false,
      },
    };
    // 订单表
    associateMany(User, models.Order, keyRename);
  };
  return User;
};
