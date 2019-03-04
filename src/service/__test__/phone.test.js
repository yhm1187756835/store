const env = require("../../__fixtures__/index");
const PhoneService = require("../phone");
const { notify } = require('../../config');
const rightPhone = '18824261965';
const badPhone = '28824261965';
const badCode = '0000';

describe("service.phone", () => {
  //测试生产验证码
  test("sendCode", async () => {
    const service = new PhoneService(env.sequelize);
    let res = await service.sendCode(rightPhone);
    expect(res).toBeDefined();
    let res2 = await service.sendCode(badPhone);
    expect(res2).toBeUndefined();
  }, 10000);

  //测试验证 验证码
  test("spendCode", async () => {
    const service = new PhoneService(env.sequelize);
    let code = await service.sendCode(rightPhone);
    //测试 错误验证码
    let badSpend = await service.spendCode(rightPhone, badCode);
    expect(badSpend).toBeFalsy();
    //测试 正确验证码
    let rightSpend = await service.spendCode(rightPhone, code);
    expect(rightSpend).toBeTruthy();
    //测试 重复使用验证码
    let rightSpendAgain = await service.spendCode(rightPhone, code);
    expect(rightSpendAgain).toBeFalsy();
    //测试 超过有效时间后
    let invalidTimeRes = await new Promise(async (res, rej) => {
      let newCode = await service.sendCode(rightPhone);

      setTimeout(async () => {
        let badSpend2 = await service.spendCode(rightPhone, newCode);
        res(badSpend2);
      }, notify.vaildTime + 1000);

    })
    expect(invalidTimeRes).toBeFalsy();

  }, notify.vaildTime + 10000);
});
