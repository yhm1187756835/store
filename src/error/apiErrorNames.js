/**
 * API错误名称
 */
const ApiErrorNames = {};

ApiErrorNames.UNKNOW_ERROR = "unknowError";
ApiErrorNames.USER_NOT_EXIST = "userNotExist";

/**
 * API错误名称对应的错误信息
 */
const errfrMap = new Map();

errfrMap.set(ApiErrorNames.UNKNOW_ERROR, { code: -1, message: '未知错误' });
errfrMap.set(ApiErrorNames.USER_NOT_EXIST, { code: 101, message: '用户不存在' });

// 根据错误名称获取错误信息
ApiErrorNames.getErrorInfo = (errorName) => {

    let errorInfo;

    if (errorName) {
        errorInfo = error_map.get(errorName);
    }

    // 如果没有对应的错误信息，默认'未知错误'
    if (!errorInfo) {
        errorName = UNKNOW_ERROR;
        errorInfo = error_map.get(errorName);
    }

    return errorInfo;
}

module.exports = ApiErrorNames;