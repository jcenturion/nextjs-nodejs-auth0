const cookie = require("cookie");
const querystring = require("querystring");

module.exports = config => async (req, res) => {
  const cookieOptions = (http = false) => {
    return {
      httpOnly: http,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: Date.now(),
      sameSite: true
    };
  };

  res.setHeader("Set-Cookie", cookie.serialize(config.cookie.name, "", cookieOptions(true)));

  const logoutURL = new URL(`https://${config.domain}/v2/logout`);
  const searchString = querystring.stringify({
    client_id: config.clientId,
    returnTo: config.baseUrl
  });
  logoutURL.search = searchString;

  res.writeHead(302, {
    Location: logoutURL
  });

  res.end();
};
