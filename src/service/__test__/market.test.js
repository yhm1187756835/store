const env = require("../../__fixtures__/index");
const MarketService = require("../market");

/**
 * 本测试使用 13312345670 13312345671 用户 其他测试需要使用请谨慎避免冲突
 */
describe("service.market", () => {
  test("buy cancel", async () => {
    // 13312345670 使用 BTC 买入 DJ002 价格 5 买入3个
    const service = new MarketService(env.sequelize);
    const models = env.sequelize.models;
    const sourceId = env.code2CoinId["BTC"];
    const targetId = env.code2CoinId["DJ002"];
    const userId = env.phone2UserId["13312345670"];
    const price = 5;
    const count = 3;

    const loadResource = async () => {
      const res = await models.UserResource.findOne({
        where: { userId, coinId: sourceId },
      });
      expect(res).toBeInstanceOf(models.UserResource);
      return [res.getDataValue("freeze")];
    };

    const [freezeInit] = await loadResource();

    await service.buyCoin(userId, sourceId, targetId, price, count);

    let [freeze] = await loadResource();
    expect(freeze).toBe(freezeInit + Math.ceil(count * price));

    let order = await models.Order.findOne({
      where: {
        sourceId,
        targetId,
        userId,
        status: "pending",
        type: "buy",
      },
    });
    expect(order).toBeInstanceOf(models.Order);

    await service.cancelOrder(userId, order.getDataValue("id"));

    order = await models.Order.findByPk(order.getDataValue("id"));
    expect(order.getDataValue("status")).toBe("cancel");

    [freeze] = await loadResource();
    expect(freeze).toBe(freezeInit);
  });
  test("sell cancel", async () => {
    // 13312345670 卖出BTC/DJ002 以5的价格卖出8个
    const service = new MarketService(env.sequelize);
    const models = env.sequelize.models;
    const sourceId = env.code2CoinId["BTC"];
    const targetId = env.code2CoinId["DJ002"];
    const userId = env.phone2UserId["13312345670"];
    const price = 5;
    const count = 8;

    const loadResource = async () => {
      const res = await models.UserResource.findOne({
        where: { userId, coinId: targetId },
      });
      expect(res).toBeInstanceOf(models.UserResource);
      return [res.getDataValue("freeze")];
    };

    const [freezeInit] = await loadResource();

    await service.sellCoin(userId, sourceId, targetId, price, count);
    let order = await models.Order.findOne({
      where: {
        sourceId,
        targetId,
        userId,
        status: "pending",
        type: "sell",
      },
    });
    expect(order).toBeInstanceOf(models.Order);

    await service.cancelOrder(userId, order.getDataValue("id"));

    order = await models.Order.findByPk(order.getDataValue("id"));
    expect(order.getDataValue("status")).toBe("cancel");

    [freeze] = await loadResource();
    expect(freeze).toBe(freezeInit);
  });
  test("buy sell one ok", async () => {
    // 13312345670 使用 BTC 买入 DJ002 价格 5 买入3个
    // 13312345671 卖出 BTC/DJ002 价格4 卖出三个 成交价格应该是5
    const service = new MarketService(env.sequelize);
    const models = env.sequelize.models;
    const sourceId = env.code2CoinId["BTC"];
    const targetId = env.code2CoinId["DJ002"];
    const A = env.phone2UserId["13312345670"];
    const B = env.phone2UserId["13312345671"];
    const buyPrice = 5;
    const sellPrice = 4;
    const count = 3;

    const loadResource = async (userId, coinId) => {
      const [res] = await models.UserResource.findOrCreate({
        where: { userId, coinId },
      });
      expect(res).toBeInstanceOf(models.UserResource);
      return [res.getDataValue("freeze"), res.getDataValue("balance")];
    };

    let aBTCFreezeInit; // a刚开始冻结的比特币
    let aBTCBalanceInit; // a刚开始可用的比特币
    let bBTCBalanceInit; // b刚开始可用的比特币
    let aDJ002BalanceInit; // a刚开始可用的DJ002
    let bDJ002FreezeInit; // b刚开始冻结的DJ002
    let bDJ002BalanceInit; // b刚开始可用的DJ002

    let aBTCFreeze;
    let aBTCBalance;
    let bBTCBalance;
    let aDJ002Balance;
    let bDJ002Freeze;
    let bDJ002Balance;

    const refreshInit = async () => {
      [aBTCFreezeInit, aBTCBalanceInit] = await loadResource(A, sourceId);
      [bBTCFreezeInit, bBTCBalanceInit] = await loadResource(B, sourceId);
      [aDJ002FreezeInit, aDJ002BalanceInit] = await loadResource(A, targetId);
      [bDJ002FreezeInit, bDJ002BalanceInit] = await loadResource(B, targetId);
    };
    const refreshCurrent = async () => {
      [aBTCFreeze, aBTCBalance] = await loadResource(A, sourceId);
      [bBTCFreeze, bBTCBalance] = await loadResource(B, sourceId);
      [aDJ002Freeze, aDJ002Balance] = await loadResource(A, targetId);
      [bDJ002Freeze, bDJ002Balance] = await loadResource(B, targetId);
    };

    await refreshInit();

    // A 先买 B 再卖 成交价为买价
    let success = Math.ceil(buyPrice * count);
    await service.buyCoin(A, sourceId, targetId, buyPrice, count);
    await refreshCurrent();
    // A 应该冻结 freeze 个比特币
    expect(aBTCFreeze).toBe(aBTCFreezeInit + success); // A BTC 冻结增加
    expect(aBTCBalance).toBe(aBTCBalanceInit - success); // A BTC 可用减少
    await service.sellCoin(B, sourceId, targetId, sellPrice, count);
    await refreshCurrent();
    expect(aBTCFreeze).toBe(aBTCFreezeInit); // A BTC 冻结相等
    expect(aBTCBalance).toBe(aBTCBalanceInit - success); // A BTC 可用减少
    expect(bBTCBalance).toBe(bBTCBalanceInit + success); // B BTC 可用增加
    expect(aDJ002Balance).toBe(aDJ002BalanceInit + count); // A DJ002 可用增加
    expect(bDJ002Balance).toBe(bDJ002BalanceInit - count); // B DJ002 可用减少

    await refreshInit();
    // B 先卖 A 在买 成交价为卖价
    success = Math.ceil(sellPrice * count);
    await service.sellCoin(B, sourceId, targetId, sellPrice, count);
    await refreshCurrent();
    expect(bDJ002Freeze).toBe(bDJ002FreezeInit + count); // B DJ002 冻结增加
    expect(bDJ002Balance).toBe(bDJ002BalanceInit - count); // B DJ002 可用减少
    await service.buyCoin(A, sourceId, targetId, buyPrice, count);
    await refreshCurrent();
    expect(bDJ002Freeze).toBe(bDJ002FreezeInit); // B DJ002 冻结不变
    expect(bDJ002Balance).toBe(bDJ002BalanceInit - count); // B DJ002 可用减少
    expect(aDJ002Balance).toBe(aDJ002BalanceInit + count); // A DJ002 可用增加
    expect(bBTCBalance).toBe(bBTCBalanceInit + success); // B BTC 可用增加
    expect(aBTCBalance).toBe(aBTCBalanceInit - success); // A BTC 可用减少
  }, 10000);

  test("buy sell one part", async () => {
    // 部分成交
    // 13312345671 使用 BTC 买入 DJ002 价格 6 买入3个 
    // 13312345670 卖出 DJ002 收入 BTC 价格 5 卖出8个
    const service = new MarketService(env.sequelize);
    const models = env.sequelize.models;
    const sourceId = env.code2CoinId["BTC"];
    const targetId = env.code2CoinId["DJ002"];
    const sellUserId = env.phone2UserId["13312345670"];
    const sellPrice = 5;
    const sellCount = 8;
    const buyUserId = env.phone2UserId["13312345671"];
    const buyPrice = 6;
    const buyCount = 3;

    const loadResource = async (userId, coinId) => {
      const [res] = await models.UserResource.findOrCreate({
        where: { userId, coinId },
      });
      expect(res).toBeInstanceOf(models.UserResource);
      return [res.getDataValue("freeze"), res.getDataValue("balance")];
    };

    let buyerBTCFreezeInit; // 买家刚开始冻结的比特币
    let buyerBTCBalanceInit; // 买家刚开始可用的比特币
    let buyerDJ002BalanceInit; // 买家刚开始可用的DJ002
    let sellerBTCBalanceInit; // 卖家刚开始可用的比特币
    let sellerDJ002FreezeInit; // 卖家刚开始冻结的DJ002
    let sellerDJ002BalanceInit; // 卖家刚开始可用的DJ002

    let buyerBTCFreeze;
    let buyerBTCBalance;
    let buyerDJ002Balance;
    let sellerBTCBalance;
    let sellerDJ002Freeze;
    let sellerDJ002Balance;

    const refreshInit = async () => {
      [sellerBTCFreezeInit, sellerBTCBalanceInit] = await loadResource(sellUserId, sourceId);
      [buyerBTCFreezeInit, buyerBTCBalanceInit] = await loadResource(buyUserId, sourceId);
      [sellerDJ002FreezeInit, sellerDJ002BalanceInit] = await loadResource(sellUserId, targetId);
      [buyerDJ002FreezeInit, buyerDJ002BalanceInit] = await loadResource(buyUserId, targetId);
    };
    const refreshCurrent = async () => {
      [sellerBTCFreeze, sellerBTCBalance] = await loadResource(sellUserId, sourceId);
      [buyerBTCFreeze, buyerBTCBalance] = await loadResource(buyUserId, sourceId);
      [sellerDJ002Freeze, sellerDJ002Balance] = await loadResource(sellUserId, targetId);
      [buyerDJ002Freeze, buyerDJ002Balance] = await loadResource(buyUserId, targetId);
    };
    await refreshInit();
    // buyer 先买 seller 再卖 成交价为买价
    let paiyAccount = Math.ceil(buyPrice * buyCount);
    await service.buyCoin(buyUserId, sourceId, targetId, buyPrice, buyCount);
    await refreshCurrent();
    // buyer 应该冻结 paiyAccount 个比特币
    expect(buyerBTCFreeze).toBe(buyerBTCFreezeInit + paiyAccount); // 买家 BTC 冻结增加
    expect(buyerBTCBalance).toBe(buyerBTCBalanceInit - paiyAccount); // 买家 BTC 可用减少

    await service.sellCoin(sellUserId, sourceId, targetId, sellPrice, sellCount);
    //此时 买家和卖家 已分别成交一部分
    let successCount = buyCount < sellCount ? buyCount : sellCount;
    let success = Math.ceil(buyPrice * successCount);
    await refreshCurrent();
    expect(buyerBTCFreeze).toBe(buyerBTCFreezeInit + paiyAccount - success); // 买家 BTC冻结=原值+需支付-已成交
    expect(buyerBTCBalance).toBe(buyerBTCBalanceInit - paiyAccount); // 买家 BTC 可用减少
    expect(buyerDJ002Balance).toBe(buyerDJ002BalanceInit + successCount); // 买家 DJ002 可用增加
    expect(sellerBTCBalance).toBe(sellerBTCBalanceInit + success); // 卖家 BTC 可用增加
    expect(sellerDJ002Balance).toBe(sellerDJ002BalanceInit - sellCount); // 卖家 DJ002 可用减少
    expect(sellerDJ002Freeze).toBe(sellerDJ002FreezeInit + sellCount - successCount); // 卖家 DJ002=原值+需支付-已成交

    //取消未完成的订单
    let sellOrder = await models.Order.findOne({
      where: {
        sourceId,
        targetId,
        userId: sellUserId,
        status: "pending",
        type: "sell",
      },
    });
    expect(sellOrder).toBeInstanceOf(models.Order);
    await service.cancelOrder(sellUserId, sellOrder.getDataValue("id"));

  }, 10000);

  test("cancel order error", async () => {
    // 13312345670 卖出BTC/DJ001 以5的价格卖出8个
    const service = new MarketService(env.sequelize);
    const models = env.sequelize.models;
    const sourceId = env.code2CoinId["BTC"];
    const targetId = env.code2CoinId["DJ001"];
    const sellUserId = env.phone2UserId["13312345670"];
    const sellPrice = 5;
    const sellCount = 8;
    await service.sellCoin(sellUserId, sourceId, targetId, sellPrice, sellCount);
    let sellOrder = await models.Order.findOne({
      where: {
        sourceId,
        targetId,
        userId: sellUserId,
        status: "pending",
        type: "sell",
      },
    });
    expect(sellOrder).toBeInstanceOf(models.Order);

    //测试 取消非本人订单 错误
    let err;
    const errUserId = env.phone2UserId["13312345671"];
    try {
      await service.cancelOrder(errUserId, sellOrder.getDataValue("id"));
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();

    //测试 取消不存在订单 
    const nonexistentOrderId = '93249283';
    err = undefined;
    try {
      await service.cancelOrder(sellUserId, nonexistentOrderId);
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();

    //测试 取消已成交订单
    const buyUserId = env.phone2UserId["13312345671"];
    const buyPrice = 6;
    const buyCount = 3;
    await service.buyCoin(buyUserId, sourceId, targetId, buyPrice, buyCount);//已存在买单，创建买单
    let buyOrder = await models.Order.findOne({
      where: {
        sourceId,
        targetId,
        userId: buyUserId,
        status: "success",
        type: "buy",
      },
    });
    expect(buyOrder).toBeInstanceOf(models.Order);

    err = undefined;
    try {
      await service.cancelOrder(sellUserId, buyOrder.getDataValue("id"));
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();

    // 测试 取消 已取消订单
    await service.cancelOrder(sellUserId, sellOrder.getDataValue("id"));
    err = undefined;
    try {
      await service.cancelOrder(sellUserId, sellOrder.getDataValue("id"));
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
  });

  test("buy sell self", async () => {
    // 自己买卖
    // 13312345671 使用 BTC 买入 DJ002 价格 6 买入2个  卖出 DJ002 价格 5 卖出8个
    const service = new MarketService(env.sequelize);
    const models = env.sequelize.models;
    const sourceId = env.code2CoinId["BTC"];
    const targetId = env.code2CoinId["DJ002"];
    const userId = env.phone2UserId["13312345671"];
    const sellPrice = 3;
    const sellCount = 2;
    const buyPrice = 6;
    const buyCount = 5;

    const loadResource = async (userId, coinId) => {
      const [res] = await models.UserResource.findOrCreate({
        where: { userId, coinId },
      });
      expect(res).toBeInstanceOf(models.UserResource);
      return [res.getDataValue("freeze"), res.getDataValue("balance")];
    };

    let BTCFreezeInit; // 买家刚开始冻结的比特币
    let BTCBalanceInit; // 买家刚开始可用的比特币
    let DJ002FreezeInit; // 卖家刚开始冻结的DJ002
    let DJ002BalanceInit; // 卖家刚开始可用的DJ002
    let BTCFreeze;
    let BTCBalance;
    let DJ002Freeze;
    let DJ002Balance;

    const refreshInit = async () => {
      [BTCFreezeInit, BTCBalanceInit] = await loadResource(userId, sourceId);
      [DJ002FreezeInit, DJ002BalanceInit] = await loadResource(userId, targetId);
    };
    const refreshCurrent = async () => {
      [BTCFreeze, BTCBalance] = await loadResource(userId, sourceId);
      [DJ002Freeze, DJ002Balance] = await loadResource(userId, targetId);
    };
    await refreshInit();
    //生产卖单
    await service.sellCoin(userId, sourceId, targetId, sellPrice, sellCount);
    await refreshCurrent();
    expect(DJ002Balance).toBe(DJ002BalanceInit - sellCount); // 卖出DJ002 该币余额值减少
    expect(DJ002Freeze).toBe(DJ002FreezeInit + sellCount); // 卖出DJ002 该币冻结值增加
    //生产买单
    await service.buyCoin(userId, sourceId, targetId, buyPrice, buyCount);
    //此时卖单成交，买单成交部分 完成买自己测试
    let sellSuccess=sellCount*sellPrice;
    await refreshCurrent();
    expect(DJ002Balance).toBe(DJ002BalanceInit ); //  DJ002 余额 不变
    expect(DJ002Freeze).toBe(DJ002FreezeInit); // DJ002 冻结 不变
   
    expect(BTCBalance).toBe(BTCBalanceInit-buyCount*buyPrice+sellSuccess); //BTC 余额=初始值-欲买入+卖出
    expect(BTCFreeze).toBe(BTCFreezeInit+buyCount*buyPrice-sellSuccess); //BTC 冻结=初始值+欲买入-卖出
    //自己产出新卖单，以完成所有买单
    await refreshCurrent();
    let sell2Count=buyCount-sellCount;
    let sell2Price=1;
    await service.sellCoin(userId, sourceId, targetId, sell2Price,sell2Count);
    await refreshCurrent();
    expect(DJ002Balance).toBe(DJ002BalanceInit ); 
    expect(DJ002Freeze).toBe(DJ002FreezeInit ); 
    expect(BTCBalance).toBe(BTCBalanceInit); 
    expect(BTCFreeze).toBe(BTCFreezeInit); 
  },10000);

  test("buy sell multi", async () => {
    // 一个复杂一点的交易场景 多人参与多人买卖

  });
});
