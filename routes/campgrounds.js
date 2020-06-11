const express = require("express");
const router = express.Router({mergeParams: true});
const Campground = require("../models/campground"),
      middleware = require("../middleware");

router.get("/", (req, res) => {
  Campground.find({}, (err, allCampgrounds) => {
    if (err) {
      console.log("Error:");
      console.log(err);
      req.flash("error", "Sorry, something went wrong.");
      res.redirect("back");
    } else {
      res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user})
    }
  });
});

router.post("/", middleware.isLoggedIn, (req, res) => {
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
      req.flash("error", "Sorry, something went wrong.")
      res.redirect("back");
    } else {
      req.flash("success", "Campground added successfully!")
      res.redirect("/campgrounds/" + newCampground._id);
    }
  })
});

router.get("/new", middleware.isLoggedIn, (req, res) => {
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

router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    res.render("campgrounds/edit", {campground: foundCampground});
  });
});

router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findOneAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
    if (err) {
      console.log("error: " + req.body.campground);
      req.flash("error", "Sorry, something went wrong.")
      res.redirect("/campgrounds");
    } else {
      console.log(req.body.campground);
      req.flash("success", "Campground updated successfully!")
      res.redirect("/campgrounds/" + req.params.id);
    }
  })
});

router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findByIdAndDelete(req.params.id, (err, deletedCampground) => {
    if (err) {
      console.log('Error! - ');
      console.log(err);
      req.flash("error", "Sorry, something went wrong.")
      res.redirect("back");
    } else {
      console.log(deletedCampground);
      req.flash("success", "Campground deleted successfully!");
      res.redirect("/campgrounds")
    }
  })
});

module.exports = router;