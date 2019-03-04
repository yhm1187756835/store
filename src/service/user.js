const DatabaseServiceBase = require("./database");
const pswhash = require('../lib/pswdhash')

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
    this.orm = sequelize.models["User"];
  }
  /**
   * 查询用户
   * @param {Object} where 
   */
  async findOne(where) {
    return this.orm.findOne({
      attributes: ["id", "name", "role"],
      where,
    });

  }
  /**
   *创建用户
   * @param {String} name 用户名
   * @param {String} password 密码
   * @param {String} role 密码
   */
  async insert(name, password, role = 'user') {
    password = pswhash(password);
    return this.orm.create(
      {
        name,
        password,
        role,
      }
    );
  }
  /**
   * 删除用户
   * @param {Object} where 
   * @param {String} role 
   */
  async delete(where, role = 'user') {
    if (role === 'root') {
      return await this.orm.destory(
        {
          where
        }
      );
    }
  }

};
