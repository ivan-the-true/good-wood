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

router.get("/:id/edit", checkCampgroundOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    res.render("campgrounds/edit", {campground: foundCampground});
  });
});

router.put("/:id", checkCampgroundOwnership, (req, res) => {
  Campground.findOneAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
    if (err) {
      console.log("error: " + req.body.campground);
      res.redirect("/campgrounds");
    } else {
      console.log(req.body.campground);
      res.redirect("/campgrounds/" + req.params.id);
    }
  })
});

router.delete("/:id", checkCampgroundOwnership, (req, res) => {
  Campground.findOneAndDelete(req.params.id, (err, deletedCampground) => {
    if (err) {
      console.log('Error! - ');
      console.log(err);
    } else {
      res.redirect("/campgrounds")
    }
  })
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}

function checkCampgroundOwnership(req, res, next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, (err, foundCampground) => {
      if (err) {
        console.log('Error! - ');
        console.log(err);
        res.redirect("back");
      } else {
        if (foundCampground.author.id.equals(req.user._id)) {
          next();
        } else {
          res.redirect("back");
        }
      }
    });
  } else {
    res.redirect("back");
  }
}

module.exports = router;