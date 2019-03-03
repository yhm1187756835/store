const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");

const basename = path.basename(__filename);

module.exports = function (database) {
  const sequelize = new Sequelize(database);
  // 建标
  fs.readdirSync(__dirname)
    .filter((file) => {
      return (
        file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
      );
    })
    .forEach((file) => {
      sequelize.import(path.join(__dirname, file));
    });
  // 创建关联
  Object.keys(sequelize.models).forEach((modelName) => {
    if (sequelize.models[modelName].associate) {
      sequelize.models[modelName].associate(sequelize.models);
    }
  });

  return sequelize;
};
