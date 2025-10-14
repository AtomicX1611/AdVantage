import express from "express";
import { requireRole } from "../middleware/roleMiddleware.js";
import { sellerMiddleware } from "../middleware/roleMiddleware.js";
import { chatRoutes } from "./charRoutes.js";
import { insertProduct } from "../controllers/seller.js";
// import { sellerLogin } from "../controllers/sellerLogin.js";
// import { sellerSignup } from "../controllers/sellerSignUp.js";
// import multer from "multer";
// import path from "path";
// import { fileURLToPath } from "url";
import { findProduct, removeProduct, removeSeller, updateSellerPassword, findSellerByEmail, findProductsBySeller, decreaseSold, increaseSold, updateSellerSubscription } from "../models/MongoUser.js";
import { isAllowed } from "../middleware/isAllowed.js";
import {
  homeController,
} from "../controllers/Seller.controller.js";



const sellerRouter = express.Router();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const BASE_DIR = path.join(__dirname, "Assets", "products");

sellerRouter.use(express.json());
sellerRouter.use(express.urlencoded({ extended: true }));
sellerRouter.use("/chats", chatRoutes);
// sellerRouter.post("/login", sellerLogin);

//Seller Dashboard route
sellerRouter.get("/", sellerMiddleware, async (req, res) => {
  console.log(req.user);
  let products;
  let request = await fetch('http://localhost:3000/seller/products', {
    method: 'GET',
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
      cookie: req.headers.cookie || "",
    },

  });
  let data = await request.json();
  console.log("data: ",data);
  res.render("SellerDashBoard.ejs", { products:data.products,message:0 });
});

export default sellerRouter;

//  const sellerRoutes=express.Router();
// sellerRoutes.use(express.json());
// sellerRoutes.use(express.urlencoded({extended:true}));

// sellerRoutes.get("/login",(req,res)=>{
//     res.render("sellerLogin.ejs");
// })
// sellerRoutes.post("/login",sellerLogin);
// sellerRoutes.post("/signup",sellerSignup);
// sellerRoutes.get("/dashboard",(req,res)=>{
//     if(req.isAuthenticated()) {
//         res.render("sellerDashboard.ejs");
//     }
//     else {
//         res.redirect("/seller/login");
//     }
// })


// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//       const productId = `${prodid.value}`;
//       const uploadPath = path.join(BASE_DIR, productId);
//       fs.mkdirSync(uploadPath, { recursive: true });
//       cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//       cb(null,file.originalname);
//   }
// });

// const upload = multer({ storage });

sellerRouter.get('/requestsPage/:productId',sellerMiddleware,(req,res)=> {
  const { productId }=req.params;
  res.render('viewRequests.ejs',{productId});
})

sellerRouter.get('/addProductForm', sellerMiddleware, (req, res) => {
  res.render('AddproductForm');
});
sellerRouter.post('/addProduct', sellerMiddleware, insertProduct);

sellerRouter.get('/remove/:sellerEmail', requireRole("admin"), async (req, res) => {
  await removeSeller(req.params.sellerEmail);
  res.redirect('/admin');
});

sellerRouter.get('/deleteProduct/:productId', sellerMiddleware, async (req, res) => {
  const { productId } = req.params; 
   let request = await fetch(`http://localhost:3000/seller/deleteProduct/${productId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.cookie || "",
      },
    })
});

// Password update routes 
sellerRouter.get('/updatePassword', (req, res) => {
  res.render('sellerUpdatePassword');
});
sellerRouter.post('/updatePassword', async (req, res) => {
  const {newPassword,confirmNewPassword,oldPassword} = req.body;
  if (req.body.newPassword !== req.body.confirmNewPassword) {
    res.status(401).json({
      success: false,
      message: "Password mismatch"
    });

  } else {
    let request = await fetch('http://localhost:3000/seller/update/password', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.cookie || "",
      },
      body:JSON.stringify({
        newPassword:newPassword,
        oldPassword:oldPassword
      })
    })
    
    let response = await request.json();
    return res.status(request.status).json(response);
  }
});

// Product accept / reject routes 
sellerRouter.get('/accept/:productId', requireRole('seller'), async (req, res) => {
  let product = await findProduct(req.params.productId);
  // console.log(product);
  if ((product.seller.email == req.user.email) && (product.sold == 1)) {
    await increaseSold(req.user.email, req.params.productId);
  }
  res.redirect('/seller');
});
sellerRouter.get('/reject/:productId', requireRole('seller'), async (req, res) => {
  let product = await findProduct(req.params.productId);
  if ((product.seller.email == req.user.email) && (product.sold == 1)) {
    console.log("calling decrease..");
    await decreaseSold(req.params.productId);
  }
  res.redirect('/seller');
});

// subscriptioin route
sellerRouter.get("/subscriptions", sellerMiddleware, async (req, res) => {
  let request = await fetch('http://localhost:3000/seller/subscriptionStatus', {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      cookie: req.headers.cookie || "",
    },
  })
  let data = await request.json();
  if (data.success) {
    let currentPlan = data.subscription
    return res.render("sellerSubscription.ejs", { currentPlan: currentPlan });
  }
  console.log("error: ", data);
})

//payment page render routes
sellerRouter.get("/subscription/vip", sellerMiddleware, (req, res) => {
  res.render("paymentPage.ejs", { mail: req.user.email, type: "VIP", Price: "100 Rs", duration: "1 Month" });
})

sellerRouter.get("/subscription/premium", sellerMiddleware, (req, res) => {
  res.render("paymentPage.ejs", { mail: req.user.email, type: "Premium", Price: "1299 Rs", duration: "1 Year" });
});

// payment route
sellerRouter.post("/payment", sellerMiddleware, async (req, res) => {
  let type = req.body.type;
  let subsNum = type === "Premium" ? 2 : 1;

  let request = await fetch('http://localhost:3000/seller/update/subscription', {
    method: 'PUT',
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
      cookie: req.headers.cookie || "",
    },
    body: JSON.stringify({
      subscription: subsNum
    })
  });
  let response = await request.json();
  if (response.success) {
    return res.status(200).json({
      success: true,
      message: "Payment successful"
    })
  }
  else {
    return res.status(400).json({
      success: false,
      message: "Something went wrong please try again later"
    })
  }
})