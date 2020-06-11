const express = require("express");
const router = express.Router({mergeParams: true}),
      middleware = require("../middleware");

const Campground = require("../models/campground"),
      Comment = require("../models/comment");

router.get("/new", middleware.isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err || !foundCampground) {
      console.log('Error! - ');
      console.log(err);
      req.flash("error", "Campground not found.")
      res.redirect("back");
    } else {
      res.render("comments/new", {campground: foundCampground});
    }
  })
});

router.post("/", middleware.isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      console.log('Error! - ');
      console.log(err);
      res.redirect("/campgrounds")
    } else {
      Comment.create(req.body.comment, (err, comment) => {
        if (err) {
          req.flash("error", "Sorry, something went wrong.")
          console.log('Error! - ');
          console.log(err);
        } else {
          console.log(req.user.username);
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          foundCampground.comments.push(comment);
          foundCampground.save();
          req.flash("success", "Comment added succesfully!")
          res.redirect("/campgrounds/" + foundCampground._id);
        }
      })
    }
  })
});

router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err || !foundCampground) {
      console.log('Error! - ');
      console.log(err);
      req.flash("error", "Campground not found.")
      res.redirect("back");
    } else {
      Comment.findById(req.params.comment_id, (err2, foundComment) => {
        if (err2) {
          console.log('Error! - ');
          console.log(err2);
        } else {
          console.log(foundComment._id);
          res.render("comments/edit",
          {
            campground: foundCampground, 
            comment: foundComment
          });
        }
      });
    }
  })
});

router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
    if (err) {
      res.redirect("back");
    } else {
      req.flash("success", "Comment updated succesfully!")
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
  Comment.findByIdAndDelete(req.params.comment_id, (err, deletedComment) => {
    if (err) {
      console.log('Error! - ');
      console.log(err);
    } else {
      req.flash("success", "Comment deleted succesfully!")
      res.redirect("/campgrounds/" + req.params.id);
    }
  })
})

module.exports = router;