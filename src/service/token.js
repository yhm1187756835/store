const jwt = require("jsonwebtoken");
const { secretKey, expiresIn } = require("../config").token;

/**
 * 会话使用的token处理
 */
module.exports = class {
  /**
   * 将用户ID和用户角色编码为token
   * @param {Integer} id 用户ID号
   * @param {String} role 用户角色
   * @return {String} token
   */
  static encode(id, role) {
    return jwt.sign({ id, role }, secretKey, {
      expiresIn,
    });
  }
  /**
   * 构造函数
   * @param {String} token 用户ID和角色产生的token
   */
  constructor(token) {
    try {
      const ctx = jwt.verify(token, secretKey);
      this.id = ctx.id;
      this.role = ctx.role;
    } catch (e) {
      this.id = undefined;
      this.role = undefined;
    }
  }
  /**
   * 通过会话环境获取用户ID
   * @param {Object} context 会话环境
   * @return {Integer|undefined} 用户ID
   */
  getUserId() {
    return this.id;
  }
  /**
   * 判断当前是否为管理员会话
   * @return {Boolean}
   */
  isManager() {
    return this.id && this.role === "manager";
  }
  /**
   * 判断当前是否为根管理会话
   * @return {Boolean}
   */
  isRoot() {
    return this.id && this.role === "root";
  }
  /**
   * 判断当前是否为特权会话
   * @return {Boolean}
   */
  isAdmin() {
    return (
      this.id && (this.role === "manager" || this.role === "root")
    );
  }
};
