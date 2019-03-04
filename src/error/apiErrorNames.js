/**
 * API错误名称
 */
const ApiErrorNames = {};

ApiErrorNames.unknowError = "unknowError";
ApiErrorNames.userNotExist = "userNotExist";
ApiErrorNames.missRegisterParms = "missRegisterParms";
ApiErrorNames.mailExisted = "mailExisted";
ApiErrorNames.invalidMail = "invalidMail";
ApiErrorNames.missGoodsParam = "missGoodsParam";
ApiErrorNames.invalidGoodsParam = "invalidGoodsParam";
/**
 * API错误名称对应的错误信息
 */
const errfrMap = new Map();

errfrMap.set(ApiErrorNames.unknowError, { code: -1, message: '未知错误' });
errfrMap.set(ApiErrorNames.userNotExist, { code: 101, message: '用户不存在' });
errfrMap.set(ApiErrorNames.missRegisterParms, { code: 102, message: '缺少邮箱或密码' });
errfrMap.set(ApiErrorNames.mailExisted, { code: 103, message: '邮箱已存在' });
errfrMap.set(ApiErrorNames.invalidMail, { code: 104, message: '邮箱无效' });
errfrMap.set(ApiErrorNames.missGoodsParam, { code: 105, message: '商品参数不足' });
errfrMap.set(ApiErrorNames.invalidGoodsParam, { code: 106, message: '非法的商品参数' });


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