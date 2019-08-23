const cookie = require("cookie");
const decodeCookie = require("./helpers/decode-cookie");

module.exports = config => (req, res) => async () => {
  const cookies = cookie.parse(req.headers.cookie);
  const cookieName = config.cookie.name;
  const content = cookies[cookieName];
  return decodeCookie(config.cookie.secret, content, cookieName).content;
};
