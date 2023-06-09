const express = require("express");
const app = express();
bodyParser = require("body-parser");
uuid = require("uuid");
morgan = require("morgan");

app.use(bodyParser.json());
app.use(morgan("common"));
app.use(express.static("public"));

app.use((err, req, res, next) => {
  console.log("Ups, sth. went wrong.");
  res.status(300).send("Multiple Choices");
  res.status(400).send("Bad Request");
  res.status(500).send("Grave Error of application");
});

let users = [
  {
    id: 1,
    name: "bert",
    favoriteMovies: [],
  },
  {
    id: 2,
    name: "martha",
    favoriteMovies: ["The Draughtman's Contract", "Passage to India"],
  },
];

let topMovies = [
  {
    title: "Passage to India",
    director: {
      name: "David Lean",
      bio: "Sir David Lean CBE (25 March 1908 – 16 April 1991) was an English film director, producer, screenwriter and editor. Widely considered one of the most important figures in British cinema, Lean directed the large-scale epics The Bridge on the River Kwai (1957), Lawrence of Arabia (1962), Doctor Zhivago (1965), and A Passage to India (1984).[1] He also directed the film adaptations of two Charles Dickens novels, Great Expectations (1946) and Oliver Twist (1948), as well as the romantic drama Brief Encounter (1945).",
      birth: "1908",
    },
    Genre: {
      name: "Adventure",
      definition:
        "An adventure film is a form of adventure fiction, and is a genre of film. Subgenres of adventure films include swashbuckler films, pirate films, and survival films. Adventure films may also be combined with other film genres such as action, comedy, drama, fantasy, science fiction, family, horror, war, or the medium of animation.",
    },
    imageURL:
      "https://upload.wikimedia.org/wikipedia/en/2/20/PassageToIndiaPoster.jpg",
  },
  {
    title: "The Draughtman's Contract",
    director: {
      name: "Peter Greenaway",
      bio: "Peter Greenaway, CBE (born 5 April 1942) is a Welsh film director, screenwriter and artist. His films are noted for the distinct influence of Renaissance and Baroque painting, and Flemish painting in particular. Common traits in his films are the scenic composition and illumination and the contrasts of costume and nudity, nature and architecture, furniture and people, sexual pleasure and painful death. ",
      birth: "1942",
    },
    Genre: {
      name: "Historical Drama",
      definition:
        "A historical drama (also period drama, period piece or just period) is a dramatic work set in a past time period, usually used in the context of film and television, which presents historical events and characters with varying degrees of fictional elements such as creative dialogue or fictional scenes which aim to compress separate events or illustrate a broader factual narrative.",
    },
    imageURL:
      "https://upload.wikimedia.org/wikipedia/en/f/f5/The_Draughtsman%27s_Contract_theatrical_poster.png",
  },
  {
    title: "Les Valseuses",
    director: {
      name: "Bertrand Blier",
      bio: "Bertrand Blier (French: [bɛʁtʁɑ̃ blje]; born 14 March 1939) is a French film director and writer. His 1978 film Get Out Your Handkerchiefs won the Academy Award for Best Foreign Language Film at the 51st Academy Awards.[2]He is the son of famous French actor Bernard Blier. His 1996 film Mon Homme was entered into the 46th Berlin International Film Festival.[3] His 2005 film How Much Do You Love Me? was entered into the 28th Moscow International Film Festival where he won the Silver George for Best Director.",
      birth: "1939",
    },
    Genre: {
      name: "Comedy",
      definition:
        "Comedy is a genre of fiction that consists of discourses or works intended to be humorous or amusing by inducing laughter, especially in theatre, film, stand-up comedy, television, radio, books, or any other entertainment medium. ",
    },
    imageURL:
      "https://fr.wikipedia.org/wiki/Les_Valseuses#/media/Fichier:Les_Valseuses_Logo.jpg",
  },
  {
    title: "Z",
    director: {
      name: "Konstantin Costa-Gavras",
      bio: "Costa-Gavras (short for Konstantinos Gavras; Greek: Κωνσταντίνος Γαβράς; born 12 February 1933) is a Greek-French film director, screenwriter, and producer who lives and works in France. He is known for political films, such as the political thriller Z (1969), which won an Academy Award for Best Foreign Language Film, and Missing (1982), for which he won the Palme d'Or and an Academy Award for Best Adapted Screenplay. Most of his films have been made in French, but six of them were made in English. ",
      birth: "1933",
    },
    Genre: {
      name: "Thriller",
      definition:
        "Thriller film, also known as suspense film or suspense thriller, is a broad film genre that evokes excitement and suspense in the audience.[1] The suspense element found in most films' plots is particularly exploited by the filmmaker in this genre. Tension is created by delaying what the audience sees as inevitable, and is built through situations that are menacing or where escape seems impossible.",
    },
    imageURL: "https://upload.wikimedia.org/wikipedia/en/8/80/CostaGavrasZ.jpg",
  },
  { title: "Lonesome Dove" },
  { title: "Morituri" },
  { title: "Die Katze" },
  { title: "La Reine Margot" },
  { title: "Trois Couleurs: Rouge" },
  { title: "Jamón Jamón" },
];

app.get("/", (req, res) => {
  res.send("root of movie web api");
});

app.get("/movies", (req, res) => {
  res.status(200).json(topMovies);
});

app.get("/users", (req, res) => {
  res.status(200).json(users);
});

app.get("/movies/:title", (req, res) => {
  const { title } = req.params;
  const movie = topMovies.find((movie) => movie.title === title);

  if (movie) {
    return res.status(200).json(movie);
  } else {
    return res.status(404).send("no such movie");
  }
});

app.get("/movies/genre/:genreName", (req, res) => {
  const { genreName } = req.params;
  const genre = topMovies.find((movie) => movie.Genre.name === genreName).Genre;

  if (genre) {
    return res.status(200).json(genre);
  } else {
    return res.status(404).send("this genre is not in movie index.");
  }
});

app.get("/movies/directors/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = topMovies.find(
    (movie) => movie.director.name === directorName
  ).director;

  if (director) {
    return res.status(200).json(director);
  } else {
    return res.status(404).send("no such director in list of directors.");
  }
});

app.post("/users", (req, res) => {
  const newUser = req.body;

  if (!newUser.name) {
    const message = "no user name indicated in request.";
    res.status(400).send(message);
  } else {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  }
});

app.put("/users/:name/:newUsername", (req, res) => {
  let user = users.find((user) => {
    return user.name === req.params.name;
  });

  if (user) {
    user.name = req.params.newUsername;
    res
      .status(201)
      .send(
        "User " + req.params.name + " has changed the name into " + user.name
      );
  } else {
    res.status(400).send("User " + req.params.name + "couldn't be found.");
  }
});

app.post("/users/:name/:favoriteMovie/", (req, res) => {
  let user = users.find((user) => {
    return user.name === req.params.name;
  });

  if (user) {
    user.favoriteMovies.push(req.params.favoriteMovie);
    res
      .status(201)
      .send(
        "Movie " +
          req.params.favoriteMovie +
          " has been added to the list of favorites of user " +
          req.params.name +
          "."
      );
  } else {
    res
      .status(400)
      .send("User " + req.params.name + "couldn't be found in list of users.");
  }
});

app.delete("/users/:id/:favoriteMovie", (req, res) => {
  let user = users.find((user) => {
    return user.id == req.params.id;
  });
  if (user) {
    users = users.filter((obj) => {
      return obj.favoriteMovies !== req.params.favoriteMovie;
    });
    res
      .status(201)
      .send(
        req.params.favoriteMovie +
          " was deleted from user " +
          req.params.id +
          "'s list of favorite movies."
      );
  } else {
    res.send("No such user in user list.");
  }
});

app.delete("/users/:id/", (req, res) => {
  const { id } = req.params;

  let userToBeRemoved = users.find((user) => {
    return user.id == id;
  });

  if (userToBeRemoved) {
    users = users.filter((user) => {
      return user.id != userToBeRemoved.id;
    });
    return res
      .status(201)
      .send("User " + id + " has been removed from user list.");
  } else {
    res.status(400).send("No user with indicated index in user list.");
  }
});

app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
