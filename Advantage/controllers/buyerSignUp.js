import { createUser, findUserByEmail } from "../models/MongoUser.js";

export const buyerSignup=async (req,res)=>{
    let {email,password,cnfpwd}=req.body;
    console.log("email: ",email);
    console.log("password: ",password);

    if(password!=cnfpwd) {
        return res.status(401).json({error:"password misMatch"});
    }

    let user=await findUserByEmail(email);
    if(user) {
        console.log("user: ",user);
        return res.status(400).json({error:"email already exists"});
    }
    
    let newUser={
        username:"newUser",
        email:email,
        password:password
    };
    createUser(newUser);
    req.login(newUser,(err)=>{
        res.status(200).json({success:"sign up success"});
    });
 
}