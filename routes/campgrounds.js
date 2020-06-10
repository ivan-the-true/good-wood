const express = require("express");
const router = express.Router({mergeParams: true});
const Campground = require("../models/campground"),
      Comment = require("../models/comment");

router.get("/", (req, res) => {
  Campground.find({}, (err, allCampgrounds) => {
    if (err) {
      console.log("Error:");
      console.log(err);
    } else {
      res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user})
    }
  });
});

router.post("/", isLoggedIn, (req, res) => {
  let name = req.body.name;
  let image = req.body.image;
  let description = req.body.description;
  let newCampground = new Campground(
    { 
      name: name, 
      image: image,
      description: description,
      author: {
        id: req.user._id,
        username: req.user.username
      }
    });
  newCampground.save((err) => {
    if (err) {
      console.log("Error: ");
      console.log(err);
    } else {
      res.redirect("/campgrounds/" + newCampground._id);
    }
  })
});

router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

router.get("/:id", (req, res) => {
  Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
    if (err) {
      console.log(err);
    } else {
      res.render("campgrounds/show", {campground: foundCampground});
    }
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}

module.exports = router;