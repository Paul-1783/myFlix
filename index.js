const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;

// mongoose.connect("mongodb://localhost:27017/myFlixdb", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const express = require("express");
let bodyParser = require("body-parser");

const { check, validationResult } = require("express-validator");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require("cors");

let allowedOrigins = ["*"];
app.use(
  cors({
    origin: (origin, callback) => {
      // if (!origin) return callback(null, true);
      // if (allowedOrigins.indexOf(origin) === -1) {
      //   let message =
      //     "The CORS policy for this application doesn't allow access from origin" +
      //     origin;
      //   return callback(new Error(message), false);
      // }
      return callback(null, true);
    },
  })
);

let auth = require("./auth")(app); //?
const passport = require("passport");
require("./passport");

uuid = require("uuid");
const morgan = require("morgan"),
  fs = require("fs"),
  path = require("path");
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

app.use(morgan("combined", { stream: accessLogStream }));

app.use(morgan("common"));
app.use(express.static("public"));

app.use((err, req, res, next) => {
  console.log("Ups, sth. went wrong.");
  res.status(300).send("Multiple Choices");
  res.status(400).send("Bad Request");
  res.status(500).send("Grave Error of application");
});

app.get("/", (req, res) => {
  res.send("root of movie web api");
});

app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => res.json(movies))
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ username: req.params.Username })
      .then((user) => {
        res.status(201).json(user);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error " + err);
      });
  }
);

app.get(
  "/movies/directors/:directorName",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Director.Name": req.params.directorName })
      .then((movie) => {
        res.json(movie.Director);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error " + err);
      });
  }
);

app.get(
  "/movies/genre/:genreName",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.genreName })
      .then((movie) => {
        res.json(movie.Genre);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error " + err);
      });
  }
);

app.get(
  "/movies/:name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.name })
      .then((movie) => {
        res.status(201).json(movie);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error " + err);
      });
  }
);

//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post(
  "/users",
  [
    check("username", "Username is required").isLength({ min: 5 }),
    check(
      "username",
      "Username contains non-aphanumerical characters - not allowed."
    ).isAlphanumeric(),
    check("password", "Password is required").not().isEmpty(),
    check("email", "Email does not appear to be valid.").isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOne({ username: req.body.username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.username + "already exists.");
        } else {
          Users.create({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            birthday: req.body.birthday,
          }).then((user) => {
            res.status(201).json(user);
          });
        }
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send("Error " + error);
      });
  }
);

app.delete(
  "/users/:Username/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found.");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).sendStatus("Error " + err);
      });
  }
);

app.delete(
  "/users/:Username/movies/:favoriteMovieId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    passport.authenticate("jwt", { session: false }),
      Users.findOneAndUpdate(
        { username: req.params.Username },
        { $pull: { favorite_movies: req.params.favoriteMovieId } },
        { new: true }
      ).then((user) => {
        if (!user) {
          return res
            .status(400)
            .send("User " + req.params.Username + " wasn't found.");
        } else {
          res.json(user);
        }
      });
  }
);

app.post(
  "/users/:name/movies/:favoriteMovieId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { username: req.params.name },
      {
        $push: { favorite_movies: req.params.favoriteMovieId },
      },
      { new: true }
    ).then((user) => {
      if (!user) {
        return res.status(400).send("User wasn't found.");
      } else {
        return res.status(201).json(user);
      }
    });
  }
);

app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  [
    check("username", "Username is required").isLength({ min: 5 }),
    check(
      "username",
      "Username contains non-aphanumerical characters - not allowed."
    ).isAlphanumeric(),
    check(
      "password",
      "Password is too short, a minimum of 5 characters is required."
    ).isLength({ min: 5 }),
    check("password", "Password is required").not().isEmpty(),
    check("email", "Email does not appear to be valid.").isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    Users.findOneAndUpdate(
      { username: req.params.Username },
      {
        $set: {
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          birthday: req.body.birthday,
        },
      },
      {
        new: true,
        returnDocument: "after",
      }
    )
      .then((doc) => {
        if (!doc) {
          return res
            .status(400)
            .send("User " + req.params.Username + " wasn't found.");
        }
        console.log("here " + doc);
        return res.status(201).json(doc);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send("Error " + error);
      });
  }
);

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
