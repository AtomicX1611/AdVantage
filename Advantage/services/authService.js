import { createUser, findUserByEmail } from "../models/User.js";

export const loginUser = (email, password) => {
  const user = findUserByEmail(email);

  if (!user) {
    throw new Error("User Doesnt exist");
  }

  if (user.password !== password) {
    throw new Error("Incorrect password");
  }
  return user;
};

export const signUpUser = (email, password, cPassword) => {
  if (password !== cPassword) {
    throw new Error("Passwords dont match");
  }
  if (findUserByEmail(email)) {
    throw new Error("Email already in use");
  }
  const newUser = {
    username: "newUser",
    email,
    password,
  };
  console.log("Creating user");
  return createUser(newUser);
};
