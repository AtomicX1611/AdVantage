import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import {
    getBuyerById,
    createBuyer,
    findBuyerByEmail,
} from "../daos/users.dao.js";
// import {
//     createSeller,
//     findSellerByEmail,
// } from "../daos/sellers.dao.js";
import { findAdminByEmail,getAdminById } from "../daos/admins.dao.js";
import { findManagerByEmail,getManagerById } from "../daos/managers.dao.js";

export const signupBuyerService = async (username, contact, email, password) => {

    const existingBuyer = await findBuyerByEmail(email);
    console.log(existingBuyer);
    if (existingBuyer) {
        return {
            success: false,
            message: "email already exists",
            status: 409,
        };
    }

    const newBuyer = await createBuyer({
        username,
        contact,
        email,
        password,
        wishlistProducts: [],
        profilePicPath: null,
    });

    const token = jwt.sign(
        { _id: newBuyer._id, role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        newBuyer,
        success: true,
        token,
    };
};

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
    console.log("Logging with password of both : ",
        password , buyer.password
    );
    
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