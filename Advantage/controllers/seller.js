import { addProduct } from "../models/MongoUser.js";
export const insertProduct = async (req,res)=>{
    let images= new Array();
    for(let i=1;req.body["image"+i] !== undefined;i++){
        images.push(req.body["image"+i]);
    }
    await addProduct(req.body.Name,req.body.price,req.body.Description,req.body.zipcode,req.user.email,images,req.body.category,req.body.district,req.body.state,req.body.city);
    res.redirect('/seller');
}