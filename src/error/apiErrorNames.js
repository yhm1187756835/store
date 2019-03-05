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
ApiErrorNames.missLoginParms = "missLoginParms";
ApiErrorNames.invalidLoginParms = "invalidLoginParms";
ApiErrorNames.needAuth = "needAuth";
ApiErrorNames.missLogin = "missLogin";
ApiErrorNames.goodExisted = "goodExisted"; 
ApiErrorNames.goodNoExisted = "goodNoExisted"; 
ApiErrorNames.missCreateManagerParms = "missCreateManagerParms";
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
errfrMap.set(ApiErrorNames.missLoginParms, { code: 107, message: '缺少账户或密码' });
errfrMap.set(ApiErrorNames.invalidLoginParms, { code: 108, message: '账户或密码错误' });
errfrMap.set(ApiErrorNames.needAuth, { code: 10403, message: '权限不足' });
errfrMap.set(ApiErrorNames.missLogin, { code: 10001, message: '未登陆' });
errfrMap.set(ApiErrorNames.goodExisted, { code: 10002, message: '商品已经存在!' });
errfrMap.set(ApiErrorNames.goodNoExisted, { code: 10003, message: '商品已经不存在!' });
errfrMap.set(ApiErrorNames.missCreateManagerParms, { code: 10003, message: '缺少管理员参数!' });

// 根据错误名称获取错误信息
ApiErrorNames.getErrorInfo = (errorName) => {

    let errorInfo;

    if (errorName) {
        errorInfo = errfrMap.get(errorName);
    }

    // 如果没有对应的错误信息，默认'未知错误'
    if (!errorInfo) {
        errorName = unknowError;
        errorInfo = errfrMap.get(errorName);
    }

    return errorInfo;
}

module.exports = ApiErrorNames;