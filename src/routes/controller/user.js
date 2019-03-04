const ApiErr = require('../../error/apiError');
const ApiErrName = require('../../error/apiErrorNames');
const util = require('../../lib/util');
const UserSer = require('../../service/user');
const pwdHash = require('../../lib/pswdhash')

exports.register = async (ctx) => {
  const { email, password } = ctx.request.body;
  // check params
  if (!email || !password) {
    throw new ApiErr(ApiErrName.missRegisterParms);
  }
  // check email
  if (!util.checkEmail(email)) {
    throw new ApiErr(ApiErrName.invalidMail);
  }
  // check if email existed
  
  const userSer = new UserSer(ctx.orm);
  const u = await userSer.findOne({ name: email })
  console.log('--------------u',u)
   if (u) {
     throw new ApiErr(ApiErrName.mailExisted);
   } else {
     // create user
     await userSer.insert({name:email,password})
   }
};

exports.login = async (ctx) => {
  const { email, password } = ctx.request.body;
  // check params
  if (!email || !password) {
    throw new ApiErr(ApiErrName.missRegisterParms);
  }
  const userSer = new UserSer(ctx.orm);
  password = pwdHash(password)
  const u = await userSer.findOne({ name: email, password: pwdHash(password) });
  if (u) {

  } else {
    // create user
    throw new ApiErr(ApiErrName.mailExisted);
  }
};