
const ApiErrorNames = require('./apiErrorNames');

/**
 * 自定义Api异常
 */
class ApiError extends Error{
    // 构造方法
    // eslint-disable-next-line require-jsdoc
    constructor(errorName){
        super();

        const errorinfo = ApiErrorNames.getErrorInfo(errorName);

        this.name = errorName;
        this.code = errorinfo.code;
        this.message = errorinfo.message;
    }
}

module.exports = ApiError;