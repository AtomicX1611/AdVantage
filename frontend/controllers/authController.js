import passport from "passport";
import {
  findUserByEmail,
  createUser,
  findSellerByEmail,
  createSeller,
} from "../models/MongoUser.js";

export const buyerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const response = await fetch("http://localhost:3000/auth/buyer/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      res.setHeader("set-cookie", setCookie);
    }
    // console.log(setCookie);

    res.status(response.status).json(data);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong in frontend proxy (buyerLogin)",
    });
  }
};


export const buyerSignup = async (req, res) => {
  try {
    const { username, contact, email, password } = req.body;

    // console.log("hehe");

    const response = await fetch("http://localhost:3000/auth/buyer/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, contact, email, password}),
    });

    const data = await response.json();

    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      res.setHeader("set-cookie", setCookie);
    }
    console.log(setCookie);

    res.status(response.status).json(data);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong in frontend proxy",
    });
  }
};


export const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const response = await fetch("http://localhost:3000/auth/seller/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      res.setHeader("set-cookie", setCookie);
    }

    res.status(response.status).json(data);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong in frontend proxy (sellerLogin)",
    });
  }
};


export const sellerSignup = async (req, res) => {
  try {
    const { username, contact, email, password } = req.body;

    const response = await fetch("http://localhost:3000/auth/seller/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, contact, email, password }),
    });

    const data = await response.json();

    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      res.setHeader("set-cookie", setCookie);
    }

    res.status(response.status).json(data);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong in frontend proxy (sellerSignup)",
    });
  }
};

export const adminLogin = async (req, res) => {
  try {
    // console.log("Hii");
    const { email, password } = req.body;

    const response = await fetch("http://localhost:3000/auth/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    // console.log("hhh");
    const data = await response.json();
    

    // console.log(response.headers);
    console.log(data);
    
    const setCookie = response.headers.get("set-cookie");
    // console.log(setCookie);
    
    if (setCookie) {
      res.setHeader("set-cookie", setCookie);
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong in frontend proxy (adminLogin)",
    });
  }
};