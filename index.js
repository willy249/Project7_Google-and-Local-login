const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const authRoute = require("./routes/auth-route");
const profileRoute = require("./routes/profile-route.js");
require("./config/passport.js");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");

const port = process.env.PORT || 8080;

// 連結mongoose
mongoose
  .connect(process.env.MONGODB_CONNECTION)
  .then(() => {
    console.log("Connexting to mongodb。。。");
  })
  .catch((e) => {
    console.log(e);
  });

// 設置 Middlewares 以及排版引擎
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize()); // 初始化 Passport
app.use(passport.session()); // 啟用 Passport 支援 session
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

app.use("/auth", authRoute);
app.use("/profile", profileRoute);

app.get("/", (req, res) => {
  return res.render("index", { user: req.user });
});

app.listen(port, () => {
  console.log("Server running on port 8080。。。");
});
