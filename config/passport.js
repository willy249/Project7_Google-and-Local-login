const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const LocalStrategy = require("passport-local");
const User = require("../models/user-model.js");
const bcrypt = require("bcrypt");

passport.serializeUser((user, done) => {
  done(null, user._id); // 將mongoDB的id，存在session
  // 並且將id簽名後，以Cookie的形式給使用者。。。
});

passport.deserializeUser(async (_id, done) => {
  let foundUser = await User.findOne({ _id });
  done(null, foundUser); // 將req.user這個屬性設定為foundUser
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://project7.fly.dev/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      let foundUser = await User.findOne({ googleID: profile.id }).exec();
      if (foundUser) {
        // 使用者已註冊，無須存入資料庫
        done(null, foundUser);
      } else {
        // 偵測到新用戶，須存入資料庫
        let newUser = new User({
          name: profile.displayName,
          googleID: profile.id,
          picture: profile.photos[0].value,
          email: profile.emails[0].value,
        });
        let saveUser = await newUser.save();
        done(null, saveUser);
      }
    }
  )
);

// HTML登入表單中，name屬性的設置值一定要為 username, password
// 否則，此函數不會自動帶入這兩值(username, password)
passport.use(
  new LocalStrategy(async (username, password, done) => {
    let foundUser = await User.findOne({ email: username }).exec();
    if (foundUser) {
      let result = await bcrypt.compare(password, foundUser.password);
      if (result) {
        done(null, foundUser);
      } else {
        done(null, false);
      }
    } else {
      done(null, false);
    }
  })
);
