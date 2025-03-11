import passport from "passport";
import { Strategy } from "passport-local";
import { findSellerByEmail } from "../models/User.js";

passport.use(
    "seller",
    new Strategy(
        {
            usernameField: "email",
            passwordField: "password",
        },
        (email, password, done) => {
            const seller = findSellerByEmail(email);
            console.log("seller: ", seller);
            if (!seller) return done(null, false, { message: "Seller Doesnt exist" });
            if (seller.password !== password) {
                return done(null, false, { message: "Incorrect password" });
            }
            return done(null, seller);
        }
    )
);

passport.serializeUser((seller, done) => {
    done(null, seller.email);
});

passport.deserializeUser((email, done) => {
    const seller = findsellerByEmail(email);
    done(null, seller);
});
