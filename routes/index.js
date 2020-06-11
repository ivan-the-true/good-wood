const express = require("express"),
      router = express.Router(),
      passport = require("passport");

const User = require("../models/user");

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
      req.flash("error", err.message);
      return res.render("register");
    } else {
      passport.authenticate("local")(req, res, () => {
        req.flash("success", "Congrats! You've been signed up and logged in!")
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
  req.flash("success", "You've been logged out.")
  res.redirect("/campgrounds");
});

module.exports = router;