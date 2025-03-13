import passport from "passport";
import { Strategy } from "passport-local";
import { findUserByEmail } from "../models/User.js";
import { findSellerByEmail } from "../models/User.js";

passport.use(
  "buyer",
  new Strategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (email, password, done) => {
      const user = findUserByEmail(email);
      console.log("user: ",user);
      if (!user) return done(null, false, { message: "User Doesnt exist" });
      if (user.password !== password) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    }
  )
);



passport.serializeUser((user, done) => {
  done(null, user.email);
});

passport.deserializeUser((email, done) => {
  const user = findUserByEmail(email);
  done(null, user);
});
