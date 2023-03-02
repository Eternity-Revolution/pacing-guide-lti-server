const router = require("express").Router();
// Requiring Ltijs
const lti = require("ltijs").Provider;

const oauth2 = require("simple-oauth2");
// const session = require("express-session");
const request = require("request");

const randomBytes = require("crypto").randomBytes;
const state = randomBytes(20).toString("hex");
// const sessionSecret = randomBytes(20).toString("hex");

const config = {
  client: {
    id: "b50abdc3-24f2-490d-ae9a-37fee2bd3439",
    secret: "Xl-eth3MZtKbHl9CpgxC90XDSklVhvPuvWp4t3YsXPs",
  },
  auth: {
    tokenHost: "https://auth.brightspace.com",
    tokenPath: "core/connect/token",
    authorizePath: "/oauth2/auth",
  },
};

const client = new oauth2.AuthorizationCode(config);

router.get("/auth", (req, res) => {
//   const redirectUri = req.query.redirect || "/";
  //   req.session.redirectUri = redirectUri;
  const authorizationUri = client.authorizeURL({
    redirect_uri: "https://localhost:3001/callback",
    scope: "quizzing:*:*",
    state: state,
  });
  res.redirect(authorizationUri);
});

router.get("/callback", async (req, res) => {
  //   const redirectUri = req.session.redirectUri || "/";
//   delete req.session.redirectUri;
  const options = {
    code: req.query.code,
    redirect_uri: "https://localhost:3001/callback",
  };

  try {
    const result = await client.getToken(options);
    process.env.accessToken = result.token.access_token; //remove this in production when flutter is connected.
    console.log("Access token:", result.token.access_token);
        res.redirect('/quizz');
//     res.send("Access token obtained!");
  } catch (error) {
    console.error("Access Token Error:", error.message);
    res.send("Failed to obtain access token");
  }
});

router.get("/quizz", async (req, res) => {
  const course_id = "18511";

  const options = {
    method: "GET",
    url: `https://ilearn.onlinelearningbc.com/d2l/api/le/1.66/${course_id}/quizzes/`,
    headers: {
      Authorization: `Bearer ${process.env.accessToken}`,
    },
    json: true,
  };

  console.log(options);
  try {
    request(options, (error, response, body) => {
      if (error) {
        console.error("Error:", error);
        return;
      }

      if (response.statusCode !== 200) {
        console.error(
          `Status: ${response.statusCode} - ${response.statusMessage}`
        );
        if (response.statusCode == 401) {
          //   const redirectUri = encodeURIComponent(
          //     `${req.protocol}://${req.get("host")}${req.originalUrl}`
          //   );
          //   console.log("Redirect URI: " + redirectUri);
          //   res.redirect(`/auth?redirect=${redirectUri}`);
          res.redirect('/auth');
          res.send("Error code: 401. Authorize API.");
        }

        // console.error('Error:', response);
        return;
      }
      res.send("Quizz Data retrieved from API.");
      console.log(body);
    });
  } catch (error) {
    console.error("API Error:", error.message);
    res.send("Failed to retrieve response from API");
  }
});

// Wildcard route to deal with redirecting to React routes
router.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "./views/index.html"))
);
module.exports = router;
