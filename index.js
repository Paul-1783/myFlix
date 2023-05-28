const express = require("express");
morgan = require("morgan");
const app = express();

app.use(morgan("common"));

let topMovies = [
  { title: "Passage to India" },
  { title: "The Draughtman's Contract" },
  { title: "Les Valseuses" },
  { title: "Z" },
  { title: "Lonesome Dove" },
  { title: "Morituri" },
  { title: "Die Katze" },
  { title: "La Reine Margot" },
  { title: "Trois Couleurs: Rouge" },
  { title: "Jamón Jamón" },
];

app.get("/movies", (req, res) => {
  res.json(topMovies);
});

app.get("/", (req, res) => {
  res.send("End of the Internet");
});

app.use(express.static("public"));

app.use((err, req, res, next) => {
  console.log("Ups, sth. went wrong.");
  res.status(300).send("Multiple Choices");
  res.status(400).send("Bad Request");
  res.status(500).send("Grave Error of application");
});

app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
