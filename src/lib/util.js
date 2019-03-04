module.exports.checkEmail = function(emial) {
    mailReg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
    if(mailReg.test(emial)){
        return true;
    }else{
        return false;
    }
  };
  