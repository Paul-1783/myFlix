const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect("mongodb://localhost:27017/myFlixdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const express = require("express");
bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

uuid = require("uuid");
morgan = require("morgan");

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

app.get("/movies", (req, res) => {
  Movies.find()
    .then((movies) => res.json(movies))
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.get("/users", (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.get("/users/:Username", (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error " + err);
    });
});

app.get("/movies/directors/:directorName", (req, res) => {
  Movies.findOne({ "Director.Name": req.params.directorName })
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error " + err);
    });
});

app.get("/movies/genre/:genreName", (req, res) => {
  Movies.findOne({ "Genre.Name": req.params.genreName })
    .then((movie) => {
      res.json(movie.Genre);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error " + err);
    });
});

app.get("/movies/:name", (req, res) => {
  Movies.findOne({ Title: req.params.name })
    .then((movie) => {
      res.status(201).json(movie);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error " + err);
    });
});

//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post("/users", (req, res) => {
  Users.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists.");
      } else {
        Users.create({
          username: req.body.username,
          password: req.body.password,
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
});

app.delete("/users/:Username/", (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
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
});

app.delete("/users/:Username/movies/:favoriteMovieId", (req, res) => {
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
});

app.post("/users/:name/movies/:favoriteMovieId", (req, res) => {
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
});

app.put("/users/:Username", (req, res) => {
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
});

app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
