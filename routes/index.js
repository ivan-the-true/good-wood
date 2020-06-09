const express = require("express"),
       router = express.Router(),
      passport = require("passport");

const Campground = require("../models/campground"),
      User = require("../models/user"),
      Comment = require("../models/comment");

router.get("/", (req, res) => {
  res.render("home");
});

router.get("/register", (req, res) => {
  res.render("register")
});

router.post("/register", (req, res) => {
  let newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      console.log('Error! - ');
      return res.render("/register");
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/campgrounds");
      })
    }
  });
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post(
  "/login",
  passport.authenticate( //middleware
    "local", //auth strategy
    {
      successRedirect: "/campgrounds", 
      failureRedirect: "/login"
    }),
);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}

module.exports = router;