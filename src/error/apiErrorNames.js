/**
 * API错误名称
 */
const ApiErrorNames = {};

ApiErrorNames.UNKNOW_ERROR = "unknowError";
ApiErrorNames.USER_NOT_EXIST = "userNotExist";
ApiErrorNames.REGISTER_PARAM = "missRegParms";
ApiErrorNames.INVAIL_MAIL = "missRegParms";
ApiErrorNames.MAIL_EXISTED = "mailExisted";
/**
 * API错误名称对应的错误信息
 */
const errfrMap = new Map();

errfrMap.set(ApiErrorNames.UNKNOW_ERROR, { code: -1, message: '未知错误' });
errfrMap.set(ApiErrorNames.USER_NOT_EXIST, { code: 101, message: '用户不存在' });
errfrMap.set(ApiErrorNames.REGISTER_PARAM, { code: 102, message: '缺少邮箱或密码' });
errfrMap.set(ApiErrorNames.MAIL_EXISTED, { code: 103, message: '邮箱已存在' });

// 根据错误名称获取错误信息
ApiErrorNames.getErrorInfo = (errorName) => {

    let errorInfo;

    if (errorName) {
        errorInfo = errfrMap.get(errorName);
    }

    // 如果没有对应的错误信息，默认'未知错误'
    if (!errorInfo) {
        errorName = UNKNOW_ERROR;
        errorInfo = errfrMap.get(errorName);
    }

    return errorInfo;
}

module.exports = ApiErrorNames;