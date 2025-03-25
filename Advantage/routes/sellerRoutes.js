import express from "express";
import { requireRole } from "../middleware/roleMiddleware.js";
import { chatRoutes } from "./charRoutes.js";
import { insertProduct } from "../controllers/seller.js";
// import { sellerLogin } from "../controllers/sellerLogin.js";
// import { sellerSignup } from "../controllers/sellerSignUp.js";
// import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { removeSeller } from "../models/User.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_DIR = path.join(__dirname, '../public/assets/products');

const sellerRouter = express.Router();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const BASE_DIR = path.join(__dirname, "Assets", "products");

sellerRouter.use(express.json());
sellerRouter.use(express.urlencoded({ extended: true }));
sellerRouter.use("/chats",chatRoutes);
// sellerRouter.post("/login", sellerLogin);

sellerRouter.get("/",requireRole("seller"),(req, res) => {
  res.render("SellerDashBoard.ejs");
});

export default sellerRouter

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



sellerRouter.get('/addProductForm',requireRole("seller"),(req,res)=>{
  res.render('AddproductForm');
});
sellerRouter.post('/addProduct',insertProduct);

sellerRouter.get('/remove/:sellerEmail',requireRole("admin"),async (req,res) =>{
  await removeSeller(req.params.sellerEmail);
  res.redirect('/admin/dashboard');
});