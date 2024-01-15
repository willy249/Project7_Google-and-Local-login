const router = require("express").Router();
const passport = require("passport");
const User = require("../models/user-model");
const bcrypt = require("bcrypt");

router.get("/login", (req, res) => {
  return res.render("login", { user: req.user });
});

router.get("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) return res.send(err);
    return res.redirect("/");
  });
});

router.get("/signup", (req, res) => {
  return res.render("signup", { user: req.user });
});

// Google驗證請求
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// 本地註冊
router.post("/signup", async (req, res) => {
  let { name, email, password } = req.body;
  if (password.length < 8) {
    req.flash("error_msg", "密碼長度過短，至少需要8個數字或英文字。");
    return res.redirect("/auth/signup");
  }

  // 確認信箱是否被註冊過
  const foundEmail = await User.findOne({ email }).exec();
  if (foundEmail) {
    req.flash(
      "error_msg",
      "信箱已被註冊。請使用另一個信箱，或者嘗試使用此信箱登入系統"
    );
    return res.redirect("/auth/signup");
  }

  // 儲存使用者
  let hashedPassword = await bcrypt.hash(password, 12);
  let newUser = new User({ name, email, password: hashedPassword });
  let saveUser = await newUser.save();
  req.flash("success_msg", "註冊成功! 現在可以登入系統了");
  return res.redirect("/auth/login");
});

// 本地登入
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login", // 登入失敗，重定向
    failureFlash: "登入失敗。帳號或密碼不正確", // 自動帶入 req.flash("error")
  }),
  (req, res) => {
    return res.redirect("/profile");
  }
);

// Google重定向
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  return res.redirect("/profile");
});

module.exports = router;
