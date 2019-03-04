const crypto = require("crypto");
const { passwordSalt } = require("config");

module.exports = function(password) {
  return crypto
    .createHash("sha256")
    .update(`${passwordSalt}${password}`, "utf8")
    .digest();
};
