const cookie = require("cookie");
const cookieOptions = require("../_util/cookie/options");

const { Issuer } = require("openid-client");

module.exports = config => async (req, res) => {
  const issuer = await Issuer.discover(`https://${config.domain}`);
  const client = new issuer.Client({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uris: [`${config.baseUrl}/login/callback`],
    response_types: ["code"]
  });
  const params = client.callbackParams(req);
  const cookies = cookie.parse(req.headers.cookie);

  const tokenSet = await client.callback(`${config.baseUrl}/login/callback`, params, {
    nonce: cookies.nonce,
    state: cookies.state
  });
  const claims = tokenSet.claims();

  if (process.env.NODE_ENV !== "production") {
    console.log(tokenSet);
  }

  const cookieEntries = [cookie.serialize("access_token", String(tokenSet.access_token), cookieOptions(true, true))];

  Object.keys(claims).forEach(claim => {
    cookieEntries.push(cookie.serialize(claim, String(claims[claim]), cookieOptions(true, true)));
  });

  res.setHeader("Set-Cookie", cookieEntries);

  res.setHeader("Location", "/");
  res.writeHead(302);
  res.end();
};
