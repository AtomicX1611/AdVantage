import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import nodemailer from 'nodemailer';

import {
    getBuyerById,
    createBuyer,
    findBuyerByEmail,
} from "../daos/users.dao.js";

import { 
    createPendingUser,
    deletePendingUser,
    findPendingUserByEmail
} from "../daos/pendingUserDao.js";


// import {
//     createSeller,
//     findSellerByEmail,
// } from "../daos/sellers.dao.js";
import { findAdminByEmail,getAdminById } from "../daos/admins.dao.js";
import { findManagerByEmail,getManagerById } from "../daos/managers.dao.js";

export const signupBuyerService = async (username, contact, email, password) => {

    const existingBuyer = await findBuyerByEmail(email);
    if (existingBuyer) {
        console.log("user already exists");
        return {
            success: false,
            message: "email already exists",
            status: 409,
        };
    }

    // delete pending user
    await deletePendingUser(email);
    
    // Generate otp 
    const otp = crypto.randomInt(100000, 999999).toString();

    // create a new one 
    createPendingUser(username,contact,email,password,otp);

    // send otp 
    await MailService(email,otp);

    return {
        status: 201,
        success: true,
        message: "Email verification OTP sent",
    }
};

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });
};

export const MailService = async (email, otp) => {
    try {
        const transporter = createTransporter();
        
        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject: `Verify your account - ${new Date().toLocaleTimeString()}`,
            text: `Your OTP is ${otp}. Valid for 10 minutes.`
        });
    } catch (error) {
        console.error('MailService error:', error);
        throw new Error('Failed to send verification email');
    }
};

const generateToken = async (id)=> {
    const token = jwt.sign(
        { _id: id, role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
    return token;
}

export const verifyEmailService = async (email,code)=> {
    try {
        const pendingUser = await findPendingUserByEmail(email);

        if(!pendingUser) {
            const user = await findBuyerByEmail(email);

            if(user) {
                const token = await generateToken(user._id);
                return {
                    status: 200,
                    success: true,
                    message: "Email already verified",
                    data: token,
                    email:user.email,
                    buyerId : user._id
                }
            }

            // No pending user && No user 
            return {
                status: 404,
                success: false,
                message: "Verification expired",
                data: null
            }
        }

        // Found a record in pending user 
        if(pendingUser.otp === code) {
            // Create new user
            const buyerData =  {
                username:pendingUser.username,
                contact:pendingUser.contact,
                email:pendingUser.email,
                password : pendingUser.password
            }
            const user = await createBuyer(buyerData);
            
            
            // delete pending user
            deletePendingUser(pendingUser.email);

            const token = await generateToken(user._id);

            return {
                status: 200,
                success: true,
                message: "Email verified successfully",                    
                data: token,
                email:user.email,
                buyerId : user._id
            }
        }

        // Invalid otp 
        return {
            status:400,
            success:false,
            message:"Invalid otp"
        }
    } catch (error) {
        console.log(error);
        return {
            status:500,
            success:false,
            message:"Server error"
        }
    }
}
// export const signupSellerService = async (username, contact, email, password) => {
//     const existingSeller = await findBuyerByEmail(email);
//     if (existingSeller) {
//         return {
//             success: false,
//             message: "email already exists",
//             status: 409,
//         };
//     }

//     const newSeller = await createBuyer({
//         username,
//         contact,
//         email,
//         password,
//         wishlistProducts: [],
//         subscription: 0,
//         profilePicPath: null,
//     });

//     const token = jwt.sign(
//         { _id: newSeller._id, role: "seller" },
//         process.env.JWT_SECRET,
//         { expiresIn: "7d" }
//     );

//     return {
//         newSeller,
//         success: true,
//         token,
//     };
// };

export const buyerLoginService = async (email, password) => {
    const buyer = await findBuyerByEmail(email);
    console.log("buyer in loginServ: ",buyer);
    if (!buyer) {
        return {
            success: false,
            status: 404,
            message: "no buyer with that email",
        }
    }
    
    if (buyer.password !== password) {
        return {
            success: false,
            status: 401,
            message: "email or password is incorrect",
        }
    }
    const token = jwt.sign(
        { _id: buyer._id, role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
    return {
        success: true,
        token,
        buyer,
    }
}

// export const sellerLoginService = async (email, password) => {
//     const seller = await findBuyerByEmail(email);

//     if (!seller) {
//         return {
//             success: false,
//             status: 404,
//             message: "no seller with that email",
//         };
//     }

//     if (seller.password !== password) {
//         return {
//             success: false,
//             status: 401,
//             message: "email or password is incorrect",
//         };
//     }

//     const token = jwt.sign(
//         { _id: seller._id, role: "seller" },
//         process.env.JWT_SECRET,
//         { expiresIn: "7d" }
//     );

//     return {
//         success: true,
//         token,
//         seller,
//     };
// };

export const adminLoginService = async (email, password) => {

    const admin = await findAdminByEmail(email);
    if (!admin) {
        return {
            success: false,
            status: 404,
            message: "no admin with that email",
        };
    }

    console.log('Log with admin ,', admin, email, password);


    if (admin.password !== password) {
        return {
            success: false,
            status: 401,
            message: "email or password is incorrect",
        };
    }

    const token = jwt.sign(
        { _id: admin._id, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        success: true,
        token,
        admin,
    };
};

export const managerLoginService = async (email, password) => {
    const manager = await findManagerByEmail(email);
    console.log(manager);
    if (!manager) {
        return {
            success: false,
            status: 404,
            message: "no manager with that email",
        };
    }

    if (manager.password !== password) {
        return {
            success: false,
            status: 401,
            message: "email or password is incorrect",
        };
    }

    const token = jwt.sign(
        { _id: manager._id, role: "manager" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        success: true,
        token,
        manager,
    };
};

export const getMyInfoService = async (id, role) => {
    if (role === "user") {
        const user = await getBuyerById(id);
        if (!user) {
            return {
                status: 404,
                success: false,
                message: "User not found"
            };
        }
        const plainUser = user.toObject();
        delete plainUser.password;
        delete plainUser.wishlistProducts;
        plainUser.role="user";

        return {
            status: 200,
            success: true,
            info: plainUser
        };
    }
    if(role==="admin"){
        const admin = await getAdminById(id);
        if (!admin) {
            return {
                status: 404,
                success: false,
                message: "Admin not found"
            };
        }
        const plainAdmin = admin.toObject();
        delete plainAdmin.password;
        plainAdmin.role="admin";
        return {
            status: 200,
            success: true,
            info: plainAdmin,
        };
    }
    if(role==="manager"){
        const manager = await getManagerById(id);
        if (!manager) {
            return {
                status: 404,
                success: false,
                message: "Manager not found"
            };
        }
        const plainManager = manager.toObject();
        delete plainManager.password;
        plainManager.role="manager";

        return {
            status: 200,
            success: true,
            info: plainManager
        };
    }
    return {
        status: 400,
        success: false,
        message: "Invalid role"
    };
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleSignInService = async (idToken) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload) {
            return {
                success: false,
                status: 401,
                message: "Invalid id token payload",
            };
        }

        if (payload.email_verified === false) {
            return {
                success: false,
                status: 401,
                message: "Google email is not verified",
            };
        }

        let user = await findBuyerByEmail(payload.email);
        
        if (!user) {           
            const username = payload.name || payload.email.split("@")[0];
            const contact = "0000000000";
            const randomPassword = crypto.randomBytes(16).toString("hex");

            user = await createBuyer({
                username,
                contact,
                email: payload.email,
                password: randomPassword,
                profilePicPath: payload.picture || null,
                wishlistProducts: [],
            });
        }

        const token = jwt.sign(
            { _id: user._id, role: "user" },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return {
            success: true,
            status: 200,
            token,
            user,
        };
    } catch (error) {
        console.log("Error in googleSignInService : ", error);
        return {
            success: false,
            status: 401,
            message: "Invalid id Token",
        };
    }
};