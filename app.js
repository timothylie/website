//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const sslRedirect = require("heroku-ssl-redirect");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sslRedirect());

//PASSPORT setup

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

// MONGODB Database setup

mongoose.connect(
  "mongodb+srv://" +
    process.env.MONGODB_LOGIN +
    "@cluster0-ysyuu.mongodb.net/timothylieDB",
  { useNewUrlParser: true, useUnifiedTopology: true }
);
mongoose.set("useCreateIndex", true);

const Schema = mongoose.Schema;

// Mongoose Schema for user
const userSchema = new Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// JOURNAL SCHEMA
// Mongoose Schema for posts
const postSchema = new Schema({
  content: String,
  date: { type: Date, default: Date.now }
});
const Post = mongoose.model("Post", postSchema);

// DARK/LIGHT MODE variable

var modeSetting = "dark";

// HOME

app.get("/", function(req, res) {
  Post.findOne()
    .sort({ date: -1 })
    .exec(function(err, posts) {
      if (err) {
        console.log(err);
      } else {
        res.render("home", {
          posts: posts,
          setting: modeSetting
        });
      }
    });
});

app.post("/", function(req, res) {
  var currentLocation = req.headers.referer;
  var currentSetting = req.body.currentMode;

  if (currentSetting === "dark") {
    modeSetting = "light";
  } else if (currentSetting === "light") {
    modeSetting = "dark";
  }
  res.redirect(currentLocation);
});

// LOGIN & REGISTER ACCOUNTS

app.get("/login", function(req, res) {
  res.render("login", {
    setting: modeSetting
  });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/compose",
    failureRedirect: "/login",
    failureFlash: false
  })
);

// app.get("/register", function(req, res) {
//   res.render("register", {
//     setting: modeSetting
//   });
// });
//
// app.post("/register", function(req, res) {
//   User.register({ username: req.body.username }, req.body.password, function(
//     err,
//     user
//   ) {
//     if (err) {
//       console.log(err);
//       res.redirect("/register");
//     } else {
//       passport.authenticate("local")(req, res, function() {
//         res.redirect("/compose");
//       });
//     }
//   });
// });

// COMPOSE

app.get("/compose", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("compose", {
      setting: modeSetting
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/compose", function(req, res) {
  const post = new Post({
    content: req.body.postBody
  });

  post.save(function(err, results) {
    if (!err) {
      res.redirect("/");
    }
  });
});

// MENU | List of all the items
app.get("/menu", function(req, res) {
  res.render("menu", {
    setting: modeSetting
  });
});

// JOURNAL

app.get("/journal", function(req, res) {
  Post.find({})
    .sort("-date")
    .exec(function(err, posts) {
      res.render("journal", {
        posts: posts,
        setting: modeSetting
      });
    });
});

app.get("/posts/:postId", function(req, res) {
  const requestedId = req.params.postId;

  Post.findById(requestedId, function(err, post) {
    if (!err) {
      res.render("post", {
        content: post.content,
        date: post.date.toDateString()
      });
    }
  });
});

//ADDRESS BOOK | Book of Address
app.get("/address-book", function(req, res) {
  res.render("address-book", {
    setting: modeSetting
  });
});

//FUND
app.get("/fund", function(req, res) {
  res.render("fund", {
    setting: modeSetting
  });
});

app.get("/fp-fund", function(req, res) {
  res.render("fp-fund", {
    setting: modeSetting
  });
});

app.get("/fp-food-beverages-index", function(req, res) {
  res.render("fp-food-beverages-index", {
    setting: modeSetting
  });
});

// MUSIC

app.get("/music", function(req, res) {
  res.render("music", {
    setting: modeSetting
  });
});

// PHOTOS

app.get("/photos", function(req, res) {
  res.render("photos", {
    setting: modeSetting
  });
});

// ARTWORKS

app.get("/artworks", function(req, res) {
  res.render("artworks", {
    setting: modeSetting
  });
});

// MILESTONES

app.get("/milestones", function(req, res) {
  res.render("milestones", {
    setting: modeSetting
  });
});

// PORT

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});
