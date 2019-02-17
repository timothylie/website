//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const sslRedirect = require("heroku-ssl-redirect");

const app = express();

mongoose.connect('mongodb+srv://' + process.env.MONGODB_LOGIN + '@cluster0-ysyuu.mongodb.net/timothylieDB', {useNewUrlParser: true});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(sslRedirect());

const Schema = mongoose.Schema;

const postSchema = new Schema({
  content: String,
  date: {type: Date, default: Date.now}
});

const Post = mongoose.model("Post", postSchema);

var modeSetting = "dark";

app.get("/", function(req, res){

  Post.findOne().sort({date: -1}).exec(function(err, posts){
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

app.get("/view", function(req, res){

  Post.find({}).sort("-date").exec(function(err, posts){
    res.render("view", {
      posts: posts,
      setting: modeSetting
      });
  });
});

app.get("/compose", function(req, res){
  res.render("compose", {
    setting: modeSetting
  });
});

app.post("/compose", function(req, res){
  const post = new Post({
    content: req.body.postBody
  });

  post.save(function(err, results){
    if (!err){
      res.redirect("/");
    }
  });
});

app.get("/posts/:postId", function(req, res){
  const requestedId = req.params.postId;

  Post.findById(requestedId, function(err, post){
    if (!err){
      res.render("post", {
        content: post.content,
        date: post.date.toDateString()
      });
    }
  });
});

app.post("/", function(req, res){
  var currentLocation = req.headers.referer;
  var currentSetting = req.body.currentMode;

  if (currentSetting === "dark") {
    modeSetting = "light";
  } else if (currentSetting === "light") {
    modeSetting = "dark";
  }
  res.redirect(currentLocation);
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});
