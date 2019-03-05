const DatabaseServiceBase = require("./database");
const pswhash = require('../lib/pswdhash');
const Auth = require('../../config/auth');
const ApiErr = require('../error/apiError');
const ApiErrName = require('../error/apiErrorNames');

/**
 * 用户服务
 */
module.exports = class User extends DatabaseServiceBase {

  /**
   * 构造函数
   * @param {Object} sequelize 
   */
  constructor(sequelize) {
    super(sequelize);
    this.orm = sequelize.models["User"];
  }

  /**
   * 检查权限
   * @param {String}  needAuth 
   * @param {String} role 
   */
  static checkAuth(needAuth, role) {
    const roleAuths = Auth[role] || [];
    let f = false;
    for (let index = 0; index < roleAuths.length; index++) {
      const auth = roleAuths[index];
      if (auth === needAuth) {
        f = true;
      }
    }
    if(!f){
      throw new ApiErr(ApiErrName.needAuth)
    }
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
