// import passport from "passport";
// import "../config/sellerPassport.js"

// export const sellerLogin=(req,res,next)=>{
//     console.log("req.body in selllerLogin: ",req.body);
//     passport.authenticate("seller",(err,user,msg)=>{
//         if(err) {
//             res.status(400)
//         }
//         if(user==false) {
//             res.status(401).json({error:"Incorrect password"})
//         }
//         else {
//             req.logIn(user,(err)=> {
//                 if(err) {
//                     next(err);
//                 }
//                 console.log("session: ",req.session);
//                 req.session.save(() => {
//                     return res.status(200).json({ success: "Login success" });
//                 });
//             })
//         }
//     })(req,res,next);
// }

