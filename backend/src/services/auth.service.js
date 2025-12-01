import jwt from "jsonwebtoken";
import {
    createBuyer,
    findBuyerByEmail,
} from "../daos/users.dao.js";
// import {
//     createSeller,
//     findSellerByEmail,
// } from "../daos/sellers.dao.js";
import { findAdminByEmail } from "../daos/admins.dao.js";
import { findManagerByEmail } from "../daos/managers.dao.js";

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
    if (!admin){
        return {
            success: false,
            status: 404,
            message: "no admin with that email",
        };
    }

    console.log('Log with admin ,',admin,email,password);
    
    
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
