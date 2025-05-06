import { findProductsBySeller } from "../models/MongoUser.js"

export const isAllowed = async function (req,res,next) {
    let prods = await findProductsBySeller(req.user.email);
    if (prods.length == 0) {
        next();
    } else {
        let count = 0, temp;
        let arr=[15,50,100];
        temp=arr[prods[0].seller.subscription];
        for (let prod of prods) {
            if (Date.now() - new Date(prod.postingDate) < (30 * 24 * 60 * 60 * 1000)) {
                count++;
            }
        }
        if(count<temp){
            next();
        }else{
            res.render('sellerDashBoard',{products:prods,message:1});
        }
    }
}