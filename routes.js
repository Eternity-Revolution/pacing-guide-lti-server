const router = require("express").Router();
// Requiring Ltijs
const lti = require("ltijs").Provider;

const oauth2 = require("simple-oauth2");
// const session = require("express-session");
const request = require("request");

const randomBytes = require("crypto").randomBytes;
const state = randomBytes(20).toString("hex");
// const sessionSecret = randomBytes(20).toString("hex");

const MongoClient = require("mongodb").MongoClient;

// const config = {
//   client: {
//     id: "b50abdc3-24f2-490d-ae9a-37fee2bd3439",
//     secret: "Xl-eth3MZtKbHl9CpgxC90XDSklVhvPuvWp4t3YsXPs",
//   },
//   auth: {
//     tokenHost: "https://auth.brightspace.com",
//     tokenPath: "/core/connect/token",
//     authorizePath: "/oauth2/auth",
//   },
// };

// const oauthClient = new oauth2.AuthorizationCode(config);

// router.get("/auth", (req, res) => {
// //   const redirectUri = req.query.redirect || "/";
//   //   req.session.redirectUri = redirectUri;
//   const authorizationUri = oauthClient.authorizeURL({
//     redirect_uri: "https://localhost:3001/callback",
//     scope: "quizzing:*:*",
//     state: state,
//   });
//   res.redirect(authorizationUri);
// });

// router.get("/callback", async (req, res) => {
//   //   const redirectUri = req.session.redirectUri || "/";
// //   delete req.session.redirectUri;
//   const options = {
//     code: req.query.code,
//     redirect_uri: "https://8e9a-2001-569-7f32-1e00-9060-7838-4520-3bf9.ngrok.io/callback",
//   };

//   try {
//     const result = await oauthClient.getToken(options);
//     process.env.accessToken = result.token.access_token; //remove this in production when flutter is connected.
//     console.log("Access token:", result.token.access_token);
//         res.redirect('/quizz');
// //     res.send("Access token obtained!");
//   } catch (error) {
//     console.error("Access Token Error:", error.message);
//     res.send("Failed to obtain access token");
//   }
// });

// router.get("/quizz", async (req, res) => {
//   const course_id = "18511";

//   const options = {
//     method: "GET",
//     url: `https://ilearn.onlinelearningbc.com/d2l/api/le/1.66/${course_id}/quizzes/`,
//     headers: {
//       Authorization: `Bearer ${process.env.accessToken}`,
//     },
//     json: true,
//   };

//   console.log(options);
//   try {
//     request(options, (error, response, body) => {
//       if (error) {
//         console.error("Error:", error);
//         return;
//       }

//       if (response.statusCode !== 200) {
//         console.error(
//           `Status: ${response.statusCode} - ${response.statusMessage}`
//         );
//         if (response.statusCode == 401) {
//           //   const redirectUri = encodeURIComponent(
//           //     `${req.protocol}://${req.get("host")}${req.originalUrl}`
//           //   );
//           //   console.log("Redirect URI: " + redirectUri);
//           //   res.redirect(`/auth?redirect=${redirectUri}`);
//           res.redirect("/auth");
//           res.send("Error code: 401. Authorize API.");
//         }

//         // console.error('Error:', response);
//         return;
//       }
//       res.send("Quizz Data retrieved from API.");
//       console.log(body);
//     });
//   } catch (error) {
//     console.error("API Error:", error.message);
//     res.send("Failed to retrieve response from API");
//   }
// });

// Connection URL and database name
const uri =
  "mongodb+srv://admin:PeaMTZuCL4UZSPEy@ilearncluster.3tc9lwg.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Get user and context information
router.get('/info', async (req, res) => {
  const token = res.locals.token
  const context = res.locals.context
  // console.log(token);
  const info = { }
  if (token.userInfo) {
    if (token.userInfo.name) info.name = token.userInfo.name
    if (token.userInfo.email) info.email = token.userInfo.email
  }

  if (context.roles) info.roles = context.roles
  if (context.context) info.context = context.context
  console.log(context)
  return res.send(info)
})

// Create a new course
router.post("/courses", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("PacingGuide").collection("Courses");
    const course = {
      CourseID: req.body.CourseID,
      CourseName: req.body.CourseName,
    };
    const result = await collection.insertOne(course);
    res.send(result);
    client.close();
  } catch (error) {
    console.log(error);
  }
});

// Get all courses
router.get("/courses", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("PacingGuide").collection("Courses");
    const result = await collection.find({}).toArray();
    res.send(result);
    client.close();
  } catch (error) {
    console.log(error);
  }
});

// Get a single course by ID
router.get("/courses/:id", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("PacingGuide").collection("Courses");
    const ObjectId = require("mongodb").ObjectId;
    const id = new ObjectId(req.params.id);
    const result = await collection.findOne({ _id: id });
    res.send(result);
    client.close();
  } catch (error) {
    console.log(error);
  }
});

// Update a course
router.put("/courses/:id", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("PacingGuide").collection("Courses");
    const ObjectId = require("mongodb").ObjectId;
    const id = new ObjectId(req.params.id);
    const result = await collection.updateOne(
      { _id: id },
      {
        $set: { CourseID: req.body.CourseID, CourseName: req.body.CourseName },
      }
    );
    res.send(result);
    client.close();
  } catch (error) {
    console.log(error);
  }
});

// Delete a course
router.delete("/courses/:id", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("PacingGuide").collection("Courses");
    const ObjectId = require("mongodb").ObjectId;
    const id = new ObjectId(req.params.id);
    const result = await collection.deleteOne({ _id: id });
    res.send(result);
    client.close();
  } catch (error) {
    console.log(error);
  }
});

// Create a new student
router.post("/students", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("PacingGuide").collection("Students");
    const student = {
      studentID: req.body.studentID,
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    };
    const result = await collection.insertOne(student);
    res.send(result);
    client.close();
  } catch (error) {
    console.log(error);
  }
});

// Get all students
router.get("/students", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("PacingGuide").collection("Students");
    const result = await collection.find({}).toArray();
    res.send(result);
    client.close();
  } catch (error) {
    console.log(error);
  }
});

// Get a single student by ID
router.get("/students/:id", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("PacingGuide").collection("Students");
    const ObjectId = require("mongodb").ObjectId;
    const id = new ObjectId(req.params.id);
    const result = await collection.findOne({ _id: id });
    res.send(result);
    client.close();
  } catch (error) {
    console.log(error);
  }
});

// Update a student
router.put("/students/:id", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("PacingGuide").collection("Students");
    const ObjectId = require("mongodb").ObjectId;
    const id = new ObjectId(req.params.id);
    const result = await collection.updateOne(
      { _id: id },
      {
        $set: {
          studentID: req.body.studentID,
          username: req.body.username,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
        },
      }
    );
    res.send(result);
    client.close();
  } catch (error) {
    console.log(error);
  }
});

// Delete a student
router.delete("/students/:id", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("PacingGuide").collection("Students");
    const ObjectId = require("mongodb").ObjectId;
    const id = new ObjectId(req.params.id);
    const result = await collection.deleteOne({ _id: id });
    res.send(result);
    client.close();
  } catch (error) {
    console.log(error);
  }
});

// Create a new quiz
router.post("/quizzes", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("PacingGuide").collection("Quizzes");
    const quiz = {
      coursePriority: req.body.coursePriority,
      courseId: req.body.courseId,
      quizzId: req.body.quizzId,
      quizzTitle: req.body.quizzTitle,
      timeInDays: req.body.timeInDays,
    };
    const result = await collection.insertOne(quiz);
    res.send(result);
    client.close();
  } catch (error) {
    console.log(error);
  }
});

// Get all quizzes
router.get("/quizzes", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("PacingGuide").collection("Quizzes");
    const result = await collection.find({}).toArray();
    res.send(result);
    client.close();
  } catch (error) {
    console.log(error);
  }
});

// Get a single quiz by ID
router.get("/quizzes/:id", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("PacingGuide").collection("Quizzes");
    const ObjectId = require("mongodb").ObjectId;
    const id = new ObjectId(req.params.id);
    const result = await collection.findOne({ _id: id });
    res.send(result);
    client.close();
  } catch (error) {
    console.log(error);
  }
});

// Update a quiz
router.put("/quizzes/:id", async (req, res) => {
  try {
    client.connect();
    const collection = client.db("PacingGuide").collection("Quizzes");
    const ObjectId = require("mongodb").ObjectId;
    const id = new ObjectId(req.params.id);
    const result = await collection.updateOne(
      { _id: id },
      {
        $set: {
          coursePriority: req.body.coursePriority,
          courseId: req.body.courseId,
          quizzId: req.body.quizzId,
          quizzTitle: req.body.quizzTitle,
          timeInDays: req.body.timeInDays,
        },
      }
    );
    res.send(result);
    client.close();
  } catch (error) {
    console.log(error);
  }
});

// Delete a quiz
router.delete("/quizzes/:id", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("PacingGuide").collection("Quizzes");
    const ObjectId = require("mongodb").ObjectId;
    const id = new ObjectId(req.params.id);
    const result = await collection.deleteOne({ _id: id });
    res.send(result);
    client.close();
  } catch (error) {
    console.log(error);
  }
});

// Get all quizzes matching a courseId
router.post("/quizzes-by-courseId", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("PacingGuide").collection("Quizzes");
    // const ObjectId = require("mongodb").ObjectId;
    // const courseId = new ObjectId(req.params.courseId);
    const result = await collection
      .find({ courseId: req.body.courseId })
      .toArray();
    res.send(result);
    client.close();
  } catch (error) {
    console.log(error);
  }
});

// Create a new term date record
router.post("/student-term-dates", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("PacingGuide").collection("StudentTermDates");
    const termDate = {
      studentID: req.body.studentID,
      courseID: req.body.courseID,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      completionDate: req.body.completionDate,
    };
    const result = await collection.insertOne(termDate);
    res.send(result);
    client.close();
  } catch (error) {
    console.log(error);
  }
});

// Get all term date records
router.get("/student-term-dates", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("PacingGuide").collection("StudentTermDates");
    const result = await collection.find({}).toArray();
    res.send(result);
    client.close();
  } catch (error) {
    console.log(error);
  }
});

// Get a single term date record by ID
router.get("/student-term-dates/:id", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("PacingGuide").collection("StudentTermDates");
    const ObjectId = require("mongodb").ObjectId;
    const id = new ObjectId(req.params.id);
    const result = await collection.findOne({ _id: id });
    res.send(result);
    client.close();
  } catch (error) {
    console.log(error);
  }
});

// Get all term date record by studentID and courseID
router.post("/student-term-dates-by-course", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("PacingGuide").collection("StudentTermDates");
    const result = await collection.findOne({
      studentID: req.body.studentID,
      courseID: req.body.courseID,
    });
    res.send(result);
    client.close();
  } catch (error) {
    console.log(error);
  }
});

// Update a term date record
router.put("/student-term-dates/:id", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("PacingGuide").collection("StudentTermDates");
    const ObjectId = require("mongodb").ObjectId;
    const id = new ObjectId(req.params.id);
    const result = await collection.updateOne(
      { _id: id },
      {
        $set: {
          studentID: req.body.studentID,
          courseID: req.body.courseID,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          completionDate: req.body.completionDate,
        },
      }
    );
    res.send(result);
    client.close();
  } catch (error) {
    console.log(error);
  }
});

// Delete a term date record
router.delete("/student-term-dates/:id", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("PacingGuide").collection("StudentTermDates");
    const ObjectId = require("mongodb").ObjectId;
    const id = new ObjectId(req.params.id);
    const result = await collection.deleteOne({ _id: id });
    res.send(result);
    client.close();
  } catch (error) {
    console.log(error);
  }
});

// Wildcard route to deal with redirecting to React routes
router.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "./views/index.html"))
);
module.exports = router;
