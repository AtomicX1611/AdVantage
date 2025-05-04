import express from "express";
import { requireRole } from "../middleware/roleMiddleware.js";
import { chatRoutes } from "./charRoutes.js";
import { insertProduct } from "../controllers/seller.js";
// import { sellerLogin } from "../controllers/sellerLogin.js";
// import { sellerSignup } from "../controllers/sellerSignUp.js";
// import multer from "multer";
// import path from "path";
// import { fileURLToPath } from "url";
import { findProduct, removeProduct, removeSeller, updateSellerPassword, findSellerByEmail, findProductsBySeller, decreaseSold, increaseSold } from "../models/MongoUser.js";



const sellerRouter = express.Router();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const BASE_DIR = path.join(__dirname, "Assets", "products");

sellerRouter.use(express.json());
sellerRouter.use(express.urlencoded({ extended: true }));
sellerRouter.use("/chats", chatRoutes);
// sellerRouter.post("/login", sellerLogin);

sellerRouter.get("/", requireRole("seller"), async (req, res) => {
  let products;
  products = await findProductsBySeller(req.user.email);
  // console.log(products);
  res.render("SellerDashBoard.ejs", { products });
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



sellerRouter.get('/addProductForm', requireRole("seller"), (req, res) => {
  res.render('AddproductForm');
});
sellerRouter.post('/addProduct', insertProduct);

sellerRouter.get('/remove/:sellerEmail', requireRole("admin"), async (req, res) => {
  await removeSeller(req.params.sellerEmail);
  res.redirect('/admin');
});

sellerRouter.post('/deleteProduct', requireRole("seller"), async (req, res) => {
  const product = await findProduct(req.body.pid);
  // console.log(req.user);
  if (product.seller.email === req.user.email) {
    console.log("hii");
    await removeProduct(req.body.pid);
    res.redirect('/seller');
  } else {
    res.redirect('/');
  }
});

sellerRouter.get('/updatePassword', (req, res) => {
  res.render('sellerUpdatePassword');
});

sellerRouter.post('/updatePassword', async (req, res) => {
  if (req.body.newPassword !== req.body.confirmNewPassword) {
    res.status(401).json("Password mismatch");
  } else {
    let seller = await findSellerByEmail(req.body.email);
    if (seller) {
      if (seller.password === req.body.oldPassword) {
        await updateSellerPassword(req.body.email, req.body.newPassword);
        req.session.destroy((err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("session destroyed successfully");
          }
        });
        res.redirect('/seller');
      } else {
        res.status(401).json("Incorrect Old Password");
      }
    } else {
      res.status(401).json("email not found");
    }
  }
});
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