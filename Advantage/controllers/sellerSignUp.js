import { createSeller, findSellerByEmail} from "../models/User.js";

export const sellerSignup=(req,res)=>{
    let {email,password,cnfpwd}=req.body;
    console.log("email: ",email);
    console.log("password: ",password);

    if(password!=cnfpwd) {
        return res.status(401).json({error:"password misMatch"});
    }
    let user=findSellerByEmail(email);
    if(user) {
        console.log("user: ",user);
        return res.status(400).json({error:"email already exists"});
    }
    let newUser={
        username:"newUser",
        email:email,
        password:password
    };
    createSeller(newUser);
    req.login(newUser,(err)=>{
        res.status(200).json({success:"sign up success"});
    });
 
}