module.exports = async (req, res) => {
  let response = "Log in so I can tell you my secret!";

  try {
    response = await req.oidc.getUser();
  } catch (e) {
    console.log(e);
  }

  res.send(response);
};
