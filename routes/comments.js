const express = require("express");
const router = express.Router({mergeParams: true});

const Campground = require("../models/campground"),
      Comment = require("../models/comment");

router.get("/new", isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      console.log('Error! - ');
      console.log(err);
    } else {
      res.render("comments/new", {campground: foundCampground});
    }
  })
});

router.post("/", isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      console.log('Error! - ');
      console.log(err);
      res.redirect("/campgrounds")
    } else {
      console.log(req.body.comment);
      Comment.create(req.body.comment, (err, comment) => {
        if (err) {
          console.log('Error! - ');
          console.log(err);
        } else {
          console.log(req.user.username);
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          foundCampground.comments.push(comment);
          foundCampground.save();
          res.redirect("/campgrounds/" + foundCampground._id);
        }
      })
    }
  })
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}

module.exports = router;