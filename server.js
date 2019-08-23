const { createServer } = require("http");

const next = require("next");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const nextRequestHandler = app.getRequestHandler();

const nextOidc = require("./nextjs-oidc");

const withOidc = nextOidc({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  baseUrl: process.env.BASE_URL,
  scope: "openid email profile",
  audience: "https://api.mysite.com"
});

app.prepare().then(() => {
  createServer(withOidc(nextRequestHandler)).listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
