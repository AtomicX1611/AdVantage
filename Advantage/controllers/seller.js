import { addProduct } from "../models/User.js";
export const insertProduct = (req,res)=>{
    let images= new Array();
    for(let i=1;req.body["image"+i] !== undefined;i++){
        images.push(req.body["image"+i]);
    }
    addProduct(req.body.Name,req.body.price,req.body.Address,req.body.Description,req.body.zipcode,req.user.email,images,req.body.category);
    res.redirect('/seller');
}