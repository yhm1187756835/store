const Token = require("../token");

describe("token", () => {
  test("good", () => {
    const token = Token.encode(1, "user");
    const object = new Token(token);
    expect(object.id).toBe(1);
    expect(object.getUserId()).toBe(1);
    expect(object.role).toBe("user");
    expect(object.isManager()).toBeFalsy();
    expect(object.isRoot()).toBeFalsy();
    expect(object.isAdmin()).toBeFalsy();
  });
  test("bad", () => {
    const object = new Token("");
    expect(object.id).toBeUndefined();
    expect(object.role).toBeUndefined();
  });
});
