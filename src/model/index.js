const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const UserSer = require('../service/user');
const logUtil = require('../lib/log');
const basename = path.basename(__filename);

module.exports = async function (database) {
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
  // 初始化 表
  await sequelize.sync({
    logging: logUtil.logInfo,
    // benchmark: true,
  });

  // create root
  const userSer = new UserSer(sequelize);
  try {
    const root = await userSer.findOne({ role: 'root' })
    if (!root) {
      await userSer.insert('root', 'root', 'root');
    }
  } catch (error) {
    logUtil.logError(null,error,null);
  }

  return sequelize;
};
