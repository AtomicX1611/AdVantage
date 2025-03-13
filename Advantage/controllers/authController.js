import passport from "passport";
import { users } from "../models/User.js";

export const login = async (req, res, next) => {
  console.log("request recived : ",req.body);
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Error during authentication:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (!user) {
      console.log("Authentication failed:", info.message);
      return res.status(401).json({ error: info.message });
    }
    user.role = "buyer"
    req.login(user, (err) => {
      if (err) {
        console.error("Error during req.login:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      console.log("User logged in:", user);
      return res.status(200).json({ success: "User logged in", user });
    });
  })(req, res, next);
};

export const signup = async (req, res) => {
  const { email, password, cPass } = req.body;
  console.log(req.body)
  if (password !== cPass) throw new Error("Passwords not matching");

  // check if user already exists
  //create user in array
  const user = {
    email: email,
    password: password,
  };

  users.push(user);

  req.login(user, (err) => {
    if (err) {
      console.error("Error during req.login:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    return res
      .status(200)
      .json({ success: "User signed up and logged in", user });
  });
};


