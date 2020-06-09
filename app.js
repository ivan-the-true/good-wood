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




app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.listen(3000, () => {
  console.log("App is now listening on port 3000");
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/campgrounds", (req, res) => {
  Campground.find({}, (err, allCampgrounds) => {
    if (err) {
      console.log("Error:");
      console.log(err);
    } else {
      res.render("campgrounds/index", {campgrounds: allCampgrounds})
    }
  });
});

app.post("/campgrounds", (req, res) => {
  let name = req.body.name;
  let image = req.body.image;
  let description = req.body.description;
  let newCampground = new Campground(
    { 
      name: name, 
      image: image,
      description: description
    });
  newCampground.save((err) => {
    if (err) {
      console.log("Error: ");
      console.log(err);
    } else {
      res.redirect("/campgrounds");
    }
  })
});

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.get("/campgrounds/:id", (req, res) => {
  Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
    if (err) {
      console.log(err);
    } else {
      res.render("campgrounds/show", {campground: foundCampground});
    }
  });
});


//==========================
//Comments Routes
//==========================

app.get("/campgrounds/:id/comments/new", (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      console.log('Error! - ');
      console.log(err);
    } else {
      res.render("comments/new", {campground: foundCampground});
    }
  })
});

app.post("/campgrounds/:id/comments", (req, res) => {
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
          foundCampground.comments.push(comment);
          foundCampground.save();
          res.redirect("/campgrounds/" + foundCampground._id);
        }
      })
    }
  })
})

//Authentication routes
app.get("/register", (req, res) => {
  res.render("register")
});

app.post("/register", (req, res) => {
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

app.get("/login", (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate( //middleware
    "local", //auth strategy
    {
      successRedirect: "/campgrounds", 
      failureRedirect: "/login"
    }),
);