import express from "express";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import cors from 'cors'

const app = express();
const port = 3000;
<<<<<<< HEAD
app.use(cors({ origin: "http://localhost:3000" }));
app.set("view engine", "ejs");
app.use(express.json());
=======
app.set("view engine","ejs");
>>>>>>> b7d59fc90f4e66f1ce328c0a35f4d03f533fd9a7
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: "user-login-session",
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

//******In memory Database (userData[]) for Temporary Use */
let userData = [   
    {
        username: "abc",
        email: "abc@gmail.com",
        password: "123"
    }
];

app.get("/", (req, res) => {
    res.render("Home.ejs");
});

app.get("/login", (req, res) => {
    res.render("Login.ejs");
})

app.post("/login", (req,res,next)=>{
    passport.authenticate("local",(err,user,msg)=>{
        if(err) {
            return next(err);
        }
        if(user==false) {
            return res.status(401).json({ error: "Incorrect password" }); 
        }
        else {
            req.logIn(user,(err)=> {
                if(err) {
                    next(err);
                }
                return res.status(200).json({success:"Login success"});
            })
        }
    })(req,res,next);
})

app.post("/signup",(req,res)=>{
    let {email,password,cnfpwd}=req.body;
    if(password!=cnfpwd) {
        return res.status(401).json({error:"password misMatch"});
    }
    for(let i=0;i<userData.length;i++) {
        if(userData[i].email===email) {
            return res.status(400).json({error:"email already exists"});
        }
    }
    let newUser={
        username:"newUser",
        email:email,
        password:password
    };
    userData.push(newUser);
    console.log("updated userData: ",userData);
    req.login(newUser,(err)=>{
        res.status(200).json({success:"sign up success"});
    });
})

app.get("/products", (req, res) => {
<<<<<<< HEAD
    res.render("productDetail.ejs", {
        name: "Page",
        description: "This is a very big desc",
        price: "40",
    });
});

passport.use("local",
    new Strategy(
        {
            usernameField: "email",
            passwordField: "password"
        },
        function verify(username, password, cb) {
            console.log("username: ",username);
            console.log("password: ",password);

            for (let i = 0; i < userData.length; i++) {
                console.log("userData[i]: ",userData[i]);
                if (userData[i].email === username) {
                    console.log("usermatched..");
                    if (userData[i].password === password) {
                        const user = userData[i];
                        return cb(null, user);
                    }
                    else {
                        return cb(null, false, {msg:"Incorrect Password"});
                    }
                }
            }
            console.log("User Not found");
            return ({msg:"user not found"}, null);
        }
    )
);

passport.serializeUser((user,cb)=>{
    cb(null,user);
});

passport.deserializeUser((user,cb)=>{
    cb(null,user);
=======
  res.render("productDetail.ejs");
>>>>>>> b7d59fc90f4e66f1ce328c0a35f4d03f533fd9a7
});


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
