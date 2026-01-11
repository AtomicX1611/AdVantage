import {
    signupBuyerService,
    // signupSellerService,
    buyerLoginService,
    // sellerLoginService,
    adminLoginService,
    managerLoginService,
    getMyInfoService,
    googleSignInService,
} from "../services/auth.service.js";


export const buyerSignup = async (req, res) => {
    try {
        console.log("in backend buyersignup");
        const { username, contact, email, password } = req.body;
        if (!username || !contact || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "username, contact, email, password something is missing",
            });
        }

        const response = await signupBuyerService(username, contact, email, password);
        if (!response.success) {
            console.log(response.message);
            return res.status(response.status).json({
                message: response.message,
                success: false,
            });
        }

        console.log("logging here with response sucess");
        res.cookie("token", response.token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
            success: true,
            message: "Buyer registered successfully",
            buyerId: response.newBuyer._id,
            email: response.newBuyer.email,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message: error.message || "Internal server error"
        });
    }
};

// export const sellerSignup = async (req, res) => {
//     try {
//         const { username, contact, email, password } = req.body;

//         if (!username || !contact || !email || !password) {
//             return res.status(400).json({
//                 success: false,
//                 message: "username, contact, email, password something is missing",
//             });
//         }

//         const response = await signupSellerService(username, contact, email, password);

//         if (!response.success) {
//             return res.status(response.status).json({
//                 message: response.message,
//                 success: false,
//             });
//         }

//         res.cookie("token", response.token, {
//             httpOnly: true,
//             maxAge: 7 * 24 * 60 * 60 * 1000
//         });

//         return res.status(201).json({
//             success: true,
//             message: "Seller registered successfully",
//             sellerId: response.newSeller._id,
//             email: response.newSeller.email,
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: error.message || "Internal server error",
//         });
//     }
// };

export const buyerLogin = async (req, res) => {
    try {
        console.log("request rcvd: ",req.body);
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "email,password both are required",
            });
        }

        const response = await buyerLoginService(email, password);
        if (!response.success) {
            console.log(response.message);
            return res.status(response.status).json({
                success: false,
                message: response.message,
            });
        }

        res.cookie("token", response.token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({
            buyerId: response.buyer._id,
            email: response.buyer.email,
            success: true,
            message: "Buyer login successful",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message || "Internal server error",
        });
    }
}

// export const sellerLogin = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({
//                 success: false,
//                 message: "email, password both are required",
//             });
//         }

//         const response = await sellerLoginService(email, password);

//         if (!response.success) {
//             return res.status(response.status).json({
//                 success: false,
//                 message: response.message,
//             });
//         }

//         res.cookie("token", response.token, {
//             httpOnly: true,
//             maxAge: 7 * 24 * 60 * 60 * 1000,
//         });

//         return res.status(200).json({
//             sellerId: response.seller._id,
//             email: response.seller.email,
//             success: true,
//             message: "Seller login successful",
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: error.message || "Internal server error",
//         });
//     }
// };

export const adminLogin = async (req, res) => {
    try {
        
        const { email, password } = req.body;

        if (!email || !password){
            return res.status(400).json({
                success: false,
                message: "email, password both are required",
            });
        }
     
        const response = await adminLoginService(email, password);
      
        
        if (!response.success) {
            return res.status(response.status).json({
                success: false,
                message: response.message,
            });
        }
        // Set token cookie
        res.cookie("token", response.token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        console.log('Returning token');
        
        return res.status(200).json({ 
            token : response.token,
            adminId: response.admin._id,
            email: response.admin.email,
            success: true,
            message: "Admin login successful",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const managerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "email, password both are required",
            });
        }

        const response = await managerLoginService(email, password);

        if (!response.success) {
            return res.status(response.status).json({
                success: false,
                message: response.message,
            });
        }

        // Set token cookie
        res.cookie("token", response.token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            managerId: response.manager._id,
            email: response.manager.email,
            success: true,
            message: "Manager login successful",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Internal server error",
        });
    }
};

export const getMyInfo = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;
        // console.log(role);
        if (!userId || !role) {
            return res.status(400).json({ message: "userId not found" });
        };
        let response = await getMyInfoService(userId, role);
        if (!response.success) {
            return res.status(response.status).json({
                success: false,
                message: response.message
            })
        }
        return res.status(response.status).json({
            success: true,
            info: response.info,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
};


export const googelSignIn = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ message: "idToken required" });
        }

        const response = await googleSignInService(idToken);

        if (!response.success) {
            return res.status(response.status).json({
                message: response.message,
                success: false,
            });
        }       

        res.cookie("token", response.token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        console.log("Logged user with google: ", response.user.email);

        return res.status(200).json({
            buyerId: response.user._id,
            email: response.user.email,
            success: true,
            message: "Google login successful",
        });
    } catch (error) {
        console.log("Error occurred : ", error);
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};