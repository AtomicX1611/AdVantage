import { loginUser, signUpUser } from "../services/authService.js";

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = loginUser(email, password);
    req.login(user, (err) => {
      if (err) throw err;
      res.status(200).json({ success: "User logged in", user });
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const signup = async (req, res) => {
    const { email, password, cPass} = req.body;
    try {
      console.log("Signing Up")

        const newUser = signUpUser(email, password, cPass);
        req.login(newUser, (err) => {
          if (err) throw err;
          console.log("User Saved");
          res.status(200).json({ success: "User signed up", user: newUser });
        });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
};
