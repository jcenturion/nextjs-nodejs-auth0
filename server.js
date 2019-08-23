const { createServer } = require("http");

const next = require("next");
const { parse } = require("url");

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
  audience: "https://api.mysite.com",
  cookie: {
    name: "my-cookie",
    secret: process.env.AUTH0_COOKIE_SECRET
  }
});

app.prepare().then(() => {
  createServer(
    withOidc((req, res) => {
      const parsedUrl = parse(req.url, true);
      nextRequestHandler(req, res, parsedUrl);
    })
  ).listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
