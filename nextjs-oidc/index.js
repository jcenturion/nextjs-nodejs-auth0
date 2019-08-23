const { parse } = require("url");
const handleLogin = require("./handlers/login");
const handleLogout = require("./handlers/logout");
const handleCallback = require("./handlers/callback");
const getUser = require("./get-user");

module.exports = config => requestListener => (req, res) => {
  const parsedUrl = parse(req.url, true);
  const { pathname } = parsedUrl;

  req.oidc = {
    getUser: getUser(config)(req, res)
  };

  switch (pathname) {
    case "/login":
      handleLogin(config)(req, res);
      break;
    case "/login/callback":
      handleCallback(config)(req, res);
      break;
    case "/logout":
      handleLogout(config)(req, res);
      break;
    default:
      requestListener(req, res, parsedUrl);
  }
};
