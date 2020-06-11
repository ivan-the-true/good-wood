const Campground = require("../models/campground"),
      Comment = require("../models/comment");

let middlewareObject = {};

middlewareObject.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()){
    return next();
  }
  req.flash("error", "You need to log in to do that.")
  res.redirect("/login");
}

middlewareObject.checkCommentOwnership = function (req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if (err) {
        console.log('Error! - ');
        console.log(err);
        req.flash("error", "Comment not found.")
        res.redirect("back");
      } else {
        if (foundComment.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You don't have permission to do that.")
          res.redirect("back");
        }
      }
    });
  } else {
    res.redirect("back");
  }
}

middlewareObject.checkCampgroundOwnership = function (req, res, next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, (err, foundCampground) => {
      if (err) {
        console.log('Error! - ');
        console.log(err);
        req.flash("error", "Campground not found.")
        res.redirect("back");
      } else {
        if (foundCampground.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You don't have permission to do that.")
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to log in to do that.")
    res.redirect("back");
  }
}

module.exports = middlewareObject;