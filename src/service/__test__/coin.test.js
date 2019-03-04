const env = require("../../__fixtures__/index");
const CoinService = require("../coin");

/**
 * 本测试使用 13312345672 用户 其他测试需要使用请谨慎避免冲突
 */
describe("service.coin", () => {
  test("pull coin good", async () => {
    const service = new CoinService(env.sequelize);
    const models = env.sequelize.models;
    const coinId = env.code2CoinId["BTC"];
    const userId = env.phone2UserId["13312345672"];
    const value = 5;

    const loadRecharge = async () => {
      return await models.UserRecharge.findAll({
        where: { userId, coinId, status: "pending", type: "pull" },
      });
    };
    const loadResource = async () => {
      const res = await models.UserResource.findOne({
        where: { userId, coinId },
      });
      expect(res).toBeInstanceOf(models.UserResource);
      return [res.getDataValue("freeze"), res.getDataValue("balance")];
    };

    // 确保13312345670提币记录为空
    expect(await loadRecharge()).toEqual([]);

    // 查询之前的资源状态
    const [freezeInit, balanceInit] = await loadResource();

    // 1. 发起提币
    await service.pullCoin(userId, coinId, value, "我的地址");
    // 2. 检查提币记录
    let recharge = await loadRecharge();
    expect(recharge.length).toBe(1);
    expect(recharge[0]).toBeInstanceOf(models.UserRecharge);
    expect(recharge[0].getDataValue("value")).toBe(value);
    expect(recharge[0].getDataValue("address")).toBe("我的地址");
    // 3. 检测资产是否冻结了5个
    let [freeze, balance] = await loadResource();
    expect(freeze - freezeInit).toBe(value);
    expect(balanceInit - balance).toBe(value);

    // 1. 取消提币
    await service.cancelPull(userId, recharge[0].getDataValue("id"));
    // 2. 检测用户资产
    [freeze, balance] = await loadResource();
    expect(freeze).toBe(freezeInit);
    expect(balance).toBe(balanceInit);
    // 3. 检测记录是否为取消
    let rechargeDone = await models.UserRecharge.findByPk(
      recharge[0].getDataValue("id"),
    );
    expect(rechargeDone.getDataValue("status")).toBe("cancel");

    // 1. 再次发起提币
    await service.pullCoin(userId, coinId, value, "我的地址");
    // 2. 检查提币记录
    recharge = await loadRecharge();
    expect(recharge.length).toBe(1);
    expect(recharge[0].getDataValue("value")).toBe(value);
    expect(recharge[0].getDataValue("address")).toBe("我的地址");
    // 3. 批准提币
    await service.allowRecharge(recharge[0].getDataValue("id"));
    // 4. 检测记录
    rechargeDone = await models.UserRecharge.findByPk(
      recharge[0].getDataValue("id"),
    );
    expect(rechargeDone.getDataValue("status")).toBe("success");
    // 5. 检测用户资源
    [freeze, balance] = await loadResource();
    expect(freeze).toBe(freezeInit);
    expect(balance).toBe(balanceInit - value);
  }, 10000);
  test("push coin good", async () => {
    const service = new CoinService(env.sequelize);
    const models = env.sequelize.models;
    const coinId = env.code2CoinId["BTC"];
    const userId = env.phone2UserId["13312345672"];
    const value = 5;

    const loadRecharge = async () => {
      return await models.UserRecharge.findAll({
        where: { userId, coinId, status: "pending", type: "push" },
      });
    };
    const loadResource = async () => {
      const res = await models.UserResource.findOne({
        where: { userId, coinId },
      });
      expect(res).toBeInstanceOf(models.UserResource);
      return [res.getDataValue("freeze"), res.getDataValue("balance")];
    };

    // 确保13312345670提币记录为空
    expect(await loadRecharge()).toEqual([]);

    // 查询之前的资源状态
    const [freezeInit, balanceInit] = await loadResource();

    // 1. 发起充币
    await service.pushCoin(userId, coinId, value, "我的地址");
    // 2. 检查提币记录
    const recharge = await loadRecharge();
    expect(recharge.length).toBe(1);
    expect(recharge[0]).toBeInstanceOf(models.UserRecharge);
    expect(recharge[0].getDataValue("value")).toBe(value);
    expect(recharge[0].getDataValue("address")).toBe("我的地址");
    // 3. 检测冻结资产是否多了
    let [freeze] = await loadResource();
    expect(freeze - freezeInit).toBe(value);

    // 4. 批准充币
    await service.allowRecharge(recharge[0].getDataValue("id"));
    // 5. 检测记录
    rechargeDone = await models.UserRecharge.findByPk(
      recharge[0].getDataValue("id"),
    );
    expect(rechargeDone.getDataValue("status")).toBe("success");
    // 6. 检测用户资源
    [freeze, balance] = await loadResource();
    expect(freeze).toBe(freezeInit);
    expect(balance).toBe(balanceInit + value);
  }, 10000);
  test("cancel allow bad", async () => {
    const service = new CoinService(env.sequelize);
    const userId = env.phone2UserId["13312345672"];
    const coinId = env.code2CoinId["BTC"];
    const runTest = async (err, callback) => {
      try {
        await callback();
        expect(true).toBeFalsy();
      } catch (e) {
        expect(e.message).toEqual(err);
      }
    }

    const newRecharge = async (type, value) => {
      return await service.rechargeDb.create({
        userId,
        coinId,
        type,
        value,
        address: "",
        status: "pending",
      });
    }
    await runTest("冻结失败: 数量错误", async () => {
      await service.pullCoin(userId, coinId, 0, "我的地址");
    });
    await runTest("冻结失败: 余额不足", async () => {
      await service.pullCoin(userId, coinId, 1000000000, "我的地址");
    });
    await runTest("记录不存在", async () => {
      await service.cancelPull(userId, 999999999);
    });
    await runTest("系统错误: 错误的充提记录", async () => {
      await service.allowRecharge(999999999);
    });
    await runTest("系统错误: 错误的充提记录", async () => {
      const recharge = await newRecharge("push", 0);
      await service.allowRecharge(recharge.getDataValue("id"));
    });
    await runTest("错误的记录", async () => {
      const recharge = await newRecharge("push", 1);
      await service.cancelPull(userId, recharge.getDataValue("id"));
    });
    await runTest("系统错误: 冻结金额不足", async () => {
      const recharge = await newRecharge("pull", 99999999);
      await service.allowRecharge(recharge.getDataValue("id"));
    });
    await runTest("解冻失败: 数量错误", async () => {
      const recharge = await newRecharge("pull", 0);
      await service.cancelPull(userId, recharge.getDataValue("id"));
    });
    await runTest("解冻失败: 余额不足", async () => {
      const recharge = await newRecharge("push", 99999999);
      await service.allowRecharge(recharge.getDataValue("id"));
    });
  }, 10000);
});