/**
 * 一对一的关联模型
 * @param {Model} major 主表
 * @param {Model} minor 关联表
 * @param {Object} param 关联参数
 */
function associateOne(major, minor, param) {
  major.hasOne(minor, param);
  minor.belongsTo(major, param);
}

/**
 * 多对一的关联模型
 * @param {Model} major 主表
 * @param {Model} minor 关联表
 * @param {Object} param 关联参数
 */
function associateMany(major, minor, param) {
  major.hasMany(minor, param);
  minor.belongsTo(major, param);
}

module.exports = {
  associateOne,
  associateMany,
};
