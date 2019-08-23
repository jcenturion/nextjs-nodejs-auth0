const cookie = require("cookie");
const fetch = require("node-fetch");

module.exports = config => async (req, res) => {
  await fetch(`https://${config.domain}/v2/logout`);

  const cookieOptions = (http = false) => {
    return {
      httpOnly: http,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: Date.now(),
      sameSite: true
    };
  };

  res.setHeader("Set-Cookie", cookie.serialize("access_token", "", cookieOptions(true)));
  res.end();
};
