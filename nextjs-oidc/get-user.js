const { Issuer } = require("openid-client");
const cookie = require("cookie");

module.exports = config => (req, res) => async () => {
  const cookies = cookie.parse(req.headers.cookie);
  const issuer = await Issuer.discover(`https://${config.domain}`);
  const client = new issuer.Client({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uris: [`${config.baseUrl}/login/callback`],
    response_types: ["code"]
  });

  return client.userinfo(cookies.access_token);
};
