const express = require("express"),
      app = express(),
      bodyParser = require("body-parser"),
      mongoose = require("mongoose"),
      flash = require("connect-flash"),
      methodOverride = require("method-override"),
      seedDB = require("./seeds"),
      passport = require("passport"),
      LocalStrategy = require("passport-local"),
      User = require("./models/user");
      
const commentRoutes = require("./routes/comments"),
      campgroundRoutes = require("./routes/campgrounds"),
      indexRoutes = require("./routes/index");

mongoose.connect("mongodb+srv://admin:_is97JwcpFkTvKF@cluster0-tqeit.mongodb.net/goodwood?retryWrites=true&w=majority", 
  {
    useNewUrlParser: true, 
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  }
).then(() => {
  console.log("connected to DB!");
}).catch(err => {
  console.log("Error", err.message);
});

app.use(express.static(__dirname + "/public"));
// seedDB();

///Passport config
app.use(require("express-session")({
  secret: "Maisy is the cutest kitty in the world.",
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use(methodOverride("_method"));

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen((process.env.PORT || 5000), () => {
  console.log("App is now listening on port 3000");
});