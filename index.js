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

// allowed urls for Cross - Origin Resource Sharing
let allowedOrigins = [
  "*",
  "http://my-react-client.s3-website-us-east-1.amazonaws.com",
  "https://paul-1783.github.io/",
  "https://paul-1783.github.io/myFlix-Angular-client",
  "https://paul-1783.github.io/myFlix-Angular-client/welcome",
  "https://myflixmovielibrary.netlify.app",
  "http://localhost:8080",
  "https://myflicsdb3.onrender.com",
  "https://myflicsdb3.com",
  "http://localhost:1234",
  "http://localhost:4200",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let message =
          "The CORS policy for this application doesn't allow access from origin" +
          origin;
        return callback(new Error(message), false);
      }
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

/**
 * @name GET /
 * @description navigates to the root element of application
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 * none
 * @example
 * Response data format
 * string
 *  */
app.get("/", (req, res) => {
  res.send("root of movie web api");
});

/**
 * @description gets all movies
 * @name GET /movies
 * @alias getMovies
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - a promise as return object.
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 * none
 * @example
 * Response data format
 * [
 *   {
 *     _id: ObjectID
 *     "Title": "",
 *     "Description": "",
 *     "Genre": ObjectID,
 *     "Director": [ObjectID],
 *     "Actors": [ObjectID],
 *     "ImagePath": "",
 *     "Featured": Boolean,
 *   }
 * ]
 */
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

/**
 * @description gets a list of all users.
 * @name GET /users
 * @alias getUsers
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - a promise as return object.
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 * JSON string
 * @example
 * Response data format
 * [
 *  {
 *   "_id": ObjectID,
 *   "username": "",
 *   "password": "",
 *   "email": "",
 *   "birthday": "",
 *   "favorite_movies": [ObjectID],
 *   "__v": 0
 *  }
 * ]
 */
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

/**
 * @description gets one user.
 * @name GET /users/:Username
 * @alias getUser
 * @param {Object} req - Express request object with parameter username.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - a promise as return object.
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 * string
 * @example
 * Request data format
 * JSON string
 * @example
 * Response data format
 *{
 *   "username": "",
 *   "password": "",
 *   "email": "",
 *   "birthday": "",
 *}
 */
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

/**
 * @description gets information on specific director
 * @alias getDirector
 * @name GET /movies/directors/:directorName
 * @param {Object} req - Express request object with parameter name of director.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - a promise as return object.
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 * JSON string
 * {
 *   "Name": "",
 *   "Bio": "",
 *   "Birthday": "",
 *   "Death": ""
 * }
 */
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

/**
 * @description gets a list of movies for specific genre.
 * @alias getGenreList
 * @name GET /movies/genre/:genreName
 * @param {Object} req - Express request object with parameter name of genre.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - a promise as return object.
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 * JSON string
 * @example
 * Response data format
 * [
 *   {
 *     _id: ObjectID
 *     "Title": "",
 *     "Description": "",
 *     "Genre": ObjectID,
 *     "Director": [ObjectID],
 *     "Actors": [ObjectID],
 *     "ImagePath": "",
 *     "Featured": Boolean,
 *   }
 * ]
 */
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

/**
 * @description gets a specific movie.
 * @name GET /movies/:name
 * @alias getGenreList
 * @param {Object} req - Express request object with parameter name of movie.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - a promise as return object.
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 * JSON string
 * @example
 * Response data format
 * {
 *  "Name" : "",
 *  "Description": ""
 * }
 */
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

/**
 * @description adds a user to database.
 * @alias addUser
 * @name POST /users
 * @param {string} username - Express request object with parameter name of user.
 * @param {string} password - Express request object with parameter password.
 * @param {string} email - Express request object with parameter email.
 * @param {date} birtday - Express request object with parameter birthday.
 * @returns {Promise<void>} - a promise as return object.
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 * none
 * Response data format
 *{
 *   "username": "",
 *   "password": "",
 *   "email": "",
 *   "birthday": "",
 *
 */
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

/**
 * @description removes a user profile from database.
 * @name DELETE /users/:Username/
 * @alias deleteUser
 * @param {string} username - - Express request object with parameter name of user.
 * @returns {Promise<void>} - a promise as return object.
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 * JSON string
 * @example
 * Response data format
 * JSON string
 */
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

/**
 * @description removes a movie from list of favorite movies in user profile.
 * @name DELETE /users/:Username/movies/:favoriteMovieId
 * @alias deleteFavMovie
 * @param {string} movieId - - Express request object with parameter id of movie.
 * @returns {Promise<void>} - a promise as return object.
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 * JSON string
 * Response data format
 * @example
 * Response data format
 * @example
 * Response data format
 *{
 *  "_id": ObjectID
 *   "username": "",
 *   "password": "",
 *   "email": "",
 *   "birthday": "",
 *  "favorite_movies": [
 *       ObjectID
 *  ],
 *}
 */
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

/**
 * @description adds a movie to list of favorite movies in user profile.
 * @name POST /users/:name/movies/:favoriteMovieId
 * @alias addsFavMovie
 * @param {string} movieId - - Express request object with parameter id of movie.
 * @returns {Promise<void>} - a promise as return object.
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 * JSON string
 * @example
 * Response data format
 *{
 *  "_id": ObjectID
 *   "username": "",
 *   "password": "",
 *   "email": "",
 *   "birthday": "",
 *  "favorite_movies": [
 *       ObjectID
 *  ],
 *}
 */
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

/**
 * @description updates user profile.
 * @alias updateUserprofile
 * @name PUT /users/:Username
 * @param {string} username - Express request object with parameter name of user.
 * @param {string} password - Express request object with parameter password.
 * @param {string} email - Express request object with parameter email.
 * @param {date} birtday - Express request object with parameter birthday.
 * @returns {Promise<void>} - a promise as return object.
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 *{
 *  "_id": ObjectID
 *   "username": "",
 *   "password": "",
 *   "email": "",
 *   "birthday": "",
 *  "favorite_movies": [
 *       ObjectID
 *  ],
 *}
 * @example
 * Response data format
 *{
 *  "_id": ObjectID
 *   "username": "",
 *   "password": "",
 *   "email": "",
 *   "birthday": "",
 *  "favorite_movies": [
 *       ObjectID
 *  ],
 *}
 */
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
    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOneAndUpdate(
      { username: req.params.Username },
      {
        $set: {
          username: req.body.username,
          password: hashedPassword,
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

// listens for requests
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
