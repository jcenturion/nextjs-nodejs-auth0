const cookie = require("cookie");
const cookieOptions = require("../_util/cookie/options");

const { Issuer } = require("openid-client");

module.exports = config => async (req, res) => {
  const issuer = await Issuer.discover(`https://${config.domain}`);
  const client = new issuer.Client({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uris: [config.redirectUri],
    response_types: ["code"]
  });
  const params = client.callbackParams(req);
  const cookies = cookie.parse(req.headers.cookie);

  const tokenSet = await client.callback(config.redirectUri, params, {
    nonce: cookies.nonce,
    state: cookies.state
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(tokenSet);
  }

  res.setHeader("Set-Cookie", [
    cookie.serialize("id_token", String(tokenSet.id_token), cookieOptions(false, true)),
    cookie.serialize("access_token", String(tokenSet.access_token), cookieOptions(true, true))
  ]);

  res.setHeader("Location", "/");
  res.writeHead(302);
  res.end();
};
