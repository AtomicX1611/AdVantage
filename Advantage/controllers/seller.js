import { acceptRequest, addProduct, rejectRequest,getRequestInfo, findProductsBySeller } from "../models/User.js";
export const insertProduct = (req,res)=>{
    let images= new Array();
    for(let i=1;req.body["image"+i] !== undefined;i++){
        images.push(req.body["image"+i]);
    }
    addProduct(req.body.Name,req.body.price,req.body.Description,req.body.zipcode,req.user.email,images,req.body.category,req.body.district,req.body.state,req.body.city);
    res.redirect('/seller');
}
export const updateSellerPasswordController = async (req, res) => {
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
};
export const acceptRequestController = async (req,res) => {
    let requestInfo= await getRequestInfo(requestId);
    //need to see the object once and update
    acceptRequest(requestInfo.userEmail,requestInfo.Price,requestInfo.productId);
    res.redirect('/seller/requests');
}
export const rejectRequestController = async (req,res) => {
    rejectRequest(req.params.requestId);
    res.redirect('/seller/requests');
}