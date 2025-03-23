import passport from "passport";
import {
  findUserByEmail,
  createUser,
  findSellerByEmail,
  createSeller,
} from "../models/User.js";

export const buyerLogin = async (req, res, next) => {
  console.log("request recived : ", req.body);

  req.body.email = req.body.email.concat("b");

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Error during authentication:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!user) {
      console.log("Authentication failed:", info.message);
      return res.status(401).json({ error: info.message });
    }
    user.role = "buyer";
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

export const buyerSignup = async (req, res) => {
  
  const { username , contact , email, password , cnfpwd } = req.body;

  if (password != cnfpwd)
    return res.status(401).json({ err: "password mismatch" });

  let fetchedUser = await findUserByEmail(email);

  console.log(fetchedUser);
  

  if (!fetchedUser) {
    const user = {
      username:username,
      contact:contact,
      email: email,
      password: password,
      role: "buyer",
    };

    createUser(user);

    req.login(user, (err) => {
      if (err) {
        console.error("Error during req.login:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      return res
        .status(200)
        .json({ success: "User signed up and logged in", user });
    });
    
  } else {
    return res.status(400).json({ err: "user already exists" });
  }
};

export const sellerLogin = async (req, res, next) => {
  console.log("request recived : ", req.body);
  req.body.email = req.body.email.concat("s");
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Error during authentication:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (!user) {
      console.log("Authentication failed:", info.message);
      return res.status(401).json({ error: info.message });
    }
    user.role = "seller";
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

export const sellerSignup = async (req, res) => {
  const { username , contact ,email, password, cnfpwd } = req.body;
  if (password != cnfpwd)
    return res.status(401).json({ err: "password mismatch" });

  // check if user already exists
  //create user in array
  let fetchedSeller = await findSellerByEmail(email);
  console.log("fetched seller: ", fetchedSeller);
  if (!fetchedSeller) {
    const user = {
      username:username,
      contact:contact,
      email: email,
      password: password,
      role: "seller",
    };

    createSeller(user);

    req.login(user, (err) => {
      if (err) {
        console.error("Error during req.login:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      return res
        .status(200)
        .json({ success: "User signed up and logged in", user });
    });
  } else {
    return res.status(400).json({ err: "user already exists" });
  }
};

let admins = [
  {
    email: "admin@gmail.com",
    password: "123",
  },
];

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
   
  const admin = admins.find((a) => a.email === email);

  if (!admin) {
    return res.status(401).json({ error: "Admin not found" });
  }

  if (admin.password !== password) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  return res
    .status(200)
    .json({ message: "Login successful"});
};
