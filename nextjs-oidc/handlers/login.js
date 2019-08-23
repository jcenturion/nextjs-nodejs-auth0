const cookie = require("cookie");
const cookieOptions = require("../_util/cookie/options");

const { Issuer, generators } = require("openid-client");

module.exports = config => async (req, res) => {
  const nonce = generators.nonce();
  const state = generators.random();
  const issuer = await Issuer.discover(`https://${config.domain}`);
  const client = new issuer.Client({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uris: [`${config.baseUrl}/login/callback`],
    response_types: ["code"]
  });
  const authUrl = client.authorizationUrl({
    scope: config.scope,
    resource: config.audience,
    nonce,
    state
  });

  res.setHeader("Set-Cookie", [
    cookie.serialize("state", String(state), cookieOptions(true, false)),
    cookie.serialize("nonce", String(nonce), cookieOptions(true, false))
  ]);

  res.writeHead(302, {
    Location: authUrl
  });

  res.end();
};
