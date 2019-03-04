const ApiErr = require('../../error/apiError');
const ApiErrName = require('../../error/apiErrorNames');
const util = require('../../lib/util');
const UserSer = require('../../service/user');
const pwdHash = require('../../lib/pswdhash')



exports.register = async (ctx) => {
  const { email, password } = ctx.request.body;
  // check params
  if (!email || !password) {
    throw new ApiErr(ApiErrName.REGISTER_PARAM);
  }
  /* // check email
  if (!util.checkEmail(email)) {
    throw new ApiErr(ApiErrName.INVAIL_MAIL);
  } */
  // check if email exisited
  const userSer = new UserSer(ctx.orm);
  
  const u = await userSer.findOne({ name:email });
  if (u) {
    throw new ApiErr(ApiErrName.MAIL_EXISTED);
  } else {
    // create user
    await userSer.insert({ name: email, password: pwdHash(password) });
  }
};

exports.login = async (ctx) => {
  const { email, password } = ctx.request.body;
  // check params
  if (!email || !password) {
    throw new ApiErr(ApiErrName.REGISTER_PARAM);
  }
  
  const userSer = new UserSer(ctx.orm);
  password= pwdHash(password) 
  const u = await userSer.findOne({ name:email ,password:password});
  if (u) {
   
  } else {
    // create user
    throw new ApiErr(ApiErrName.MAIL_EXISTED);
  }
};