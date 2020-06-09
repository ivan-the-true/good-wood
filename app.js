const express = require("express"),
      app = express(),
      request = require("request-promise"),
      bodyParser = require("body-parser"),
      mongoose = require("mongoose"),
      Campground = require("./models/campground"),
      seedDB = require("./seeds");
      Comment = require("./models/comment"),
      passport = require("passport"),
      LocalStrategy = require("passport-local"),
      User = require("./models/user");
      
const commentRoutes = require("./routes/comments"),
      campgroundRoutes = require("./routes/campgrounds"),
      indexRoutes = require("./routes/index");

mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect("mongodb://localhost/good_wood");
app.use(express.static(__dirname + "/public"));
// seedDB();

///Passport config
app.use(require("express-session")({
  secret: "Maisy is the cutest kitty in the world.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(3000, () => {
  console.log("App is now listening on port 3000");
});