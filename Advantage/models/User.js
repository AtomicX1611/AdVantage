import mysql from "mysql2";
import { products } from "./Products.js";

const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'fsd',
    password : '1005',
    database : 'advantage'
});

async function initializeDatabase() {
    return new Promise((resolve, reject) => {
            // db.run("PRAGMA foreign_keys = ON;");
            db.query(
                `CREATE TABLE IF NOT EXISTS users(
                    username VARCHAR(200) NOT NULL,
                    contact VARCHAR(40) NOT NULL,
                    email VARCHAR(200) PRIMARY KEY,
                    password VARCHAR(200) NOT NULL
                )`, (err) => {
                if (err) {
                    console.log(err.message);
                } else {
                    console.log("users table created in memory.");
                }
            }
            );
            db.query(
                `CREATE TABLE IF NOT EXISTS sellers(
                    username VARCHAR(200) NOT NULL,
                    contact VARCHAR(40) NOT NULL,
                    email VARCHAR(200) PRIMARY KEY,
                    password VARCHAR(200) NOT NULL
                )`, (err) => {
                if (err) {
                    console.log(err.message);
                } else {
                    console.log("sellers table created in memory.");
                }
            }
            );
            db.query(
                `CREATE TABLE IF NOT EXISTS products (
                    Name VARCHAR(200) NOT NULL,
                    Price DECIMAL(20,2) NOT NULL,
                    Description MEDIUMTEXT NOT NULL,
                    PostingDate DATE DEFAULT (CURDATE()),
                    zipCode INT NOT NULL,
                    SellerEmail VARCHAR(200) NOT NULL,
                    ProductId INT PRIMARY KEY AUTO_INCREMENT,
                    verified TINYINT DEFAULT 0,
                    category VARCHAR(200) NOT NULL,
                    District MEDIUMTEXT NOT NULL,
                    City VARCHAR(200) NOT NULL,
                    State VARCHAR(200) NOT NULL,
                    SoldTo VARCHAR(200) DEFAULT NULL,
                    FOREIGN KEY (SoldTo) REFERENCES users (email) ON DELETE SET NULL,
                    FOREIGN KEY (SellerEmail) REFERENCES sellers (email) ON DELETE CASCADE,
                    CHECK (state IN (
                    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
                    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
                    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
                    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
                    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
                    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
                    ))
                )`, (err) => {
                if (err) {
                    console.error(err.message);
                } else {
                    console.log("products table created successfully");
                }
            }
            );
            db.query(
                `CREATE TABLE IF NOT EXISTS images(
                        ProductId INT NOT NULL,
                        Image MEDIUMTEXT NOT NULL,
                        FOREIGN KEY (ProductId) REFERENCES products (ProductId) ON DELETE CASCADE
                    )`, (err) => {
                if (err) {
                    console.error(err.message);
                } else {
                    console.log("images table created successfully");
                }
            }
            );
            db.query(
                `CREATE TABLE IF NOT EXISTS wishlist (
                        userEmail VARCHAR(200) NOT NULL,
                        ProductId INT NOT NULL,
                        UNIQUE(ProductId, userEmail),
                        FOREIGN KEY (ProductId) REFERENCES products (ProductId) ON DELETE CASCADE
                    )`,
                (err) => {
                    if (err) {
                        console.error("Error creating table:", err.message);
                    } else {
                        console.log("wishlist table created in memory.");
                    }
                }
            );
            db.query(
                `CREATE TABLE IF NOT EXISTS requests(
                    requestId INT PRIMARY KEY AUTO_INCREMENT,
                    userEmail VARCHAR(200) NOT NULL,
                    productId INT NOT NULL,
                    Price REAL NOT NULL,
                    UNIQUE(ProductId, userEmail,Price),
                    FOREIGN KEY (ProductId) REFERENCES products (ProductId) ON DELETE CASCADE
                )`,(err) =>{
                    if(err){
                        console.error(err.message);
                    }else{
                        resolve();
                    }
                }
            )
    });
}

// real inserting dummy data
// (async function () {
//     await initializeDatabase();
//     await createSeller({
//         username: "sk",
//         contact: '1234567890',
//         email: "sk@gmail.com",
//         password: "12345678"
//     });
//     await createSeller({
//         username: "abc",
//         contact: '1234567890',
//         email: "abc@gmail.com",
//         password: "12345678"
//     });

//     for (let product of products) {
//         addProduct(product.name, product.price, product.description, product.zipcode, product.sellerEmail, product.images, product.category, product.district, product.state, product.city);
//     }
//     addProduct("test product 1", '500', "test producttest producttest producttest producttest producttest producttest producttest producttest product", '522003', 'abc@gmail.com', ['https://m.media-amazon.com/images/I/71vVzlZINxL._SX695_.jpg'], 'Fashion', 'guntur', 'Andhra Pradesh', 'guntur');
//     addProduct("test product 2", '500', "test producttest producttest producttest producttest producttest producttest producttest producttest product", '522003', 'abc@gmail.com', ['https://m.media-amazon.com/images/I/71vVzlZINxL._SX695_.jpg'], 'Fashion', 'guntur', 'Andhra Pradesh', 'guntur');
//     addProduct("test product 3", '500', "test producttest producttest producttest producttest producttest producttest producttest producttest product", '522003', 'abc@gmail.com', ['https://m.media-amazon.com/images/I/71vVzlZINxL._SX695_.jpg'], 'Fashion', 'guntur', 'Andhra Pradesh', 'guntur');
//     addProduct("test product 4", '500', "test producttest producttest producttest producttest producttest producttest producttest producttest product", '522003', 'abc@gmail.com', ['https://m.media-amazon.com/images/I/71vVzlZINxL._SX695_.jpg'], 'Fashion', 'guntur', 'Andhra Pradesh', 'guntur');
//     addProduct("test product 5", '500', "test producttest producttest producttest producttest producttest producttest producttest producttest product", '522003', 'abc@gmail.com', ['https://m.media-amazon.com/images/I/71vVzlZINxL._SX695_.jpg'], 'Fashion', 'guntur', 'Andhra Pradesh', 'guntur');
//     addProduct("test product 6", '500', "test producttest producttest producttest producttest producttest producttest producttest producttest product", '522003', 'abc@gmail.com', ['https://m.media-amazon.com/images/I/71vVzlZINxL._SX695_.jpg'], 'Fashion', 'guntur', 'Andhra Pradesh', 'guntur');
//     addProduct("test product 7", '500', "test producttest producttest producttest producttest producttest producttest producttest producttest product", '522003', 'abc@gmail.com', ['https://m.media-amazon.com/images/I/71vVzlZINxL._SX695_.jpg'], 'Fashion', 'guntur', 'Andhra Pradesh', 'guntur');
// })();

let admins = [
    {
        email: "abc@gmail.com",
        password: "12345678"
    }
]

export const findAdmins = (email) => {
    return admins.find(admin => admin.email === email);
}
/*let users = [
    {
        username: "abc",
        email: "abc@gmail.com",
        password: "123",
        role : "buyer",
    },
    {
        username: "SK",
        email: "sk@gmail.com",
        password: "123",
        role : "buyer",
//*********CONVERSATIONS QUERIES STARTS HERE************* */
db.query(
    `create table if not exists conversation (
        sellerMail VARCHAR(200) not null,
        sender VARCHAR(200),
        buyerMail VARCHAR(200) not null,
        message VARCHAR(200) NOT NULL,
        date DATETIME not null
    )`, (err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log("Conversations table created successfully");
    }
}
);


export const findMessages = async (seller, buyer) => {
    return new Promise((resolve, reject) => {
        let query = `select sellerMail from conversation where buyerMail=? and sellerMail=?`;
        db.query(query, [buyer, seller], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

export const findSendersForEmail = async (buyer) => {
    return new Promise((resolve, reject) => {
        let query = `select distinct sellerMail from conversation where buyerMail=?`;
        db.query(query, [buyer], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

export const findSendersForSeller = async (seller) => {
    return new Promise((resolve, reject) => {
        let query = `select distinct buyerMail from conversation where sellerMail=?`;
        //fetching all buyerMails for this seller********
        db.query(query, [seller], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

export const createContact = (seller, buyer) => {
    // ENSURE BIDIRECTIONNAL CONTACT
    return new Promise((resolve, reject) => {
        const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const message = '__init';
        const query = `
            INSERT INTO conversation (sellerMail, buyerMail, message, date)
            VALUES (?, ?, ?, ?)
        `;
        db.query(query, [seller, buyer, message, date], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve({
                    message: 'Contact created successfully!',
                    sellerMail: seller,
                    buyerMail: buyer,
                    date: date
                });
            }
        });
    });
};

export const senderList = async (result) => {
    return new Promise((resolve, reject) => {
        if (result.length === 0) {
            resolve([]);
            return;
        }

        const sellerEmails = [];
        for (let i = 0; i < result.length; i++) {
            sellerEmails.push(result[i].sellerMail);
        }

        const placeholders = sellerEmails.map(() => '?').join(',');
        //here placholders is an array of emails
        const query = `
        SELECT 
        username AS senderUsername, 
        email AS sender
        FROM sellers
        WHERE email IN (${placeholders})
`;
        db.query(query, sellerEmails, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

export const buyerList = async (result) => {
    return new Promise((resolve, reject) => {
        if (result.length === 0) {
            resolve([]);
            return;
        }
        const buyerEmails = [];
        for (let i = 0; i < result.length; i++) {
            buyerEmails.push(result[i].buyerMail);
        }
        console.log("buyerEmails: ", buyerEmails);
        const placeholders = buyerEmails.map(() => '?').join(',');
        //here placholders is an array of emails
        const query = `
        SELECT 
        username AS senderUsername, 
        email AS sender
        FROM users
        WHERE email IN (${placeholders})
`;
        db.query(query, buyerEmails, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}
export const fetchConversations = (sellerMail, buyerMail) => {
    console.log("entered fetchConversations in user.js", sellerMail, buyerMail);
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * 
            FROM conversation
            WHERE (sellerMail = ? AND buyerMail = ?)
               OR (sellerMail = ? AND buyerMail = ?)
            ORDER BY date ASC
        `;
        // 1 change done here in select statement
        db.query(
            query,
            [sellerMail, buyerMail, buyerMail, sellerMail],
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            }
        );
    });
};

//sender field added extra in this..................
export const saveMessage = async (sellerMail, buyerMail, message, sender) => {
    return new Promise((resolve, reject) => {
        const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const query = `
            INSERT INTO conversation (sellerMail, sender,buyerMail, message, date)
            VALUES (?, ?, ?, ?, ?)
        `;
        db.query(
            query,
            [sellerMail, sender, buyerMail, message, currentDateTime],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        sellerMail,
                        sender,
                        buyerMail,
                        message,
                        date: currentDateTime,
                    });
                }
            }
        );
    });
};
//conversation queries end here

// export let prodid = { value: 0 };

// export const freshProducts = [
//     { name: "Product 1", image: "https://m.media-amazon.com/images/I/51u461LQQQL._SY695_.jpg", ProductId: "2" },
//     { name: "Product 2", image: "https://m.media-amazon.com/images/I/51u461LQQQL._SY695_.jpg", ProductId: "2" },
//     { name: "Product 3", image: "https://m.media-amazon.com/images/I/51u461LQQQL._SY695_.jpg", ProductId: "2" },
//     { name: "Product 4", image: "https://m.media-amazon.com/images/I/51OTzdpNAiL._AC_UF1000,1000_QL80_.jpg", ProductId: "9" },
//     { name: "Product 5", image: "https://m.media-amazon.com/images/I/61x3xPK2UUL.jpg", ProductId: "10" },
//     { name: "Product 6", image: "", ProductId: "2" },
//     { name: "Product 7", image: "", ProductId: "2" },
//     { name: "Product 8", image: "", ProductId: "2" },
// ];


// export const featuredProducts = [
//     { name: "Product 1", image: "https://m.media-amazon.com/images/I/51u461LQQQL._SY695_.jpg", ProductId: "2" },
//     { name: "Product 2", image: "https://m.media-amazon.com/images/I/51u461LQQQL._SY695_.jpg", ProductId: "2" },
//     { name: "Product 3", image: "https://m.media-amazon.com/images/I/51u461LQQQL._SY695_.jpg", ProductId: "2" },
//     { name: "Product 4", image: "https://fullyfilmy.in/cdn/shop/files/1_4_32af5fcd-7547-455c-ac64-4a0eb7bbc0a7.jpg?v=1710755206", ProductId: "8" },
//     { name: "Product 5", image: "", ProductId: "2" },
//     { name: "Product 6", image: "", ProductId: "2" },
//     { name: "Product 7", image: "", ProductId: "2" },
//     { name: "Product 8", image: "", ProductId: "2" },
// ];

export const featuredProducts = async () => {
    return new Promise((resolve, reject) => {
        let query = `
            SELECT * FROM products
            LIMIT 10`;

        db.query(query, async (err, rows) => {
            if (err) {
                reject(err);
            } else {
                for (let row of rows) {
                    let Images = await findImages(row.ProductId);
                    for (let j = 0; j < Images.length; j++) {
                        row[`Image${j + 1}Src`] = Images[j].Image;
                    }
                }
                resolve(rows);
            }
        });
    });
};


export const freshProducts = async () => {
    return new Promise((resolve, reject) => {
        let query = `
            SELECT * FROM products
            LIMIT 15 OFFSET 10
        `;

        db.query(query, async (err, rows) => {
            if (err) {
                reject(err);
            } else {
                for (let row of rows) {
                    let Images = await findImages(row.ProductId);
                    for (let j = 0; j < Images.length; j++) {
                        row[`Image${j + 1}Src`] = Images[j].Image;
                    }
                }
                resolve(rows);
            }
        });
    });
};



// Anyone using this function must use await
const findImages = async function (prodId) {
    return new Promise((resolve, reject) => {
        let query = `SELECT Image FROM images WHERE ProductId=?`;
        db.query(query, [prodId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Anyone using this function must use await
export const findProducts = async function (Name) {
    return new Promise((resolve, reject) => {
        let names = Name.split(" ");
        let bestMatchCondition = names.map(() => "(Name LIKE ?)").join("+");
        let query = `SELECT *, (${bestMatchCondition}) AS best_match FROM products HAVING best_match > 0 ORDER BY best_match DESC`;
        // console.log(query);
        let params = names.map(nam => `%${nam}%`);
        db.query(query, params, async (err, rows) => {
            if (err) {
                console.log(err.message);
                reject("error");
            } else {
                let Images;
                for (let i = 0; i < rows.length; i++) {
                    Images = await findImages(rows[i].ProductId);
                    for (let j = 0; j < Images.length; j++) {
                        rows[i][`Image${j + 1}Src`] = Images[j].Image;
                    }
                }
                resolve(rows);
            }
        });
    });
}

// Anyone using this function must use await
export const findProduct = function (prodId) {
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM products WHERE ProductId = ?`
        db.query(query, [prodId], async (err, row) => {
            if (err) {
                reject(err);
            } else {
                let Images = await findImages(row[0].ProductId);
                for (let j = 0; j < Images.length; j++) {
                    row[0][`Image${j + 1}Src`] = Images[j].Image;
                }
                // console.log(row,Images);
                resolve(row[0]);
            }
        });
    });
}


export const addProduct = function (Name, Price, Description, zipCode, sellerEmail, images, category, district, state, city) {
    let query = `INSERT INTO products (Name, Price, Description, zipCode, sellerEmail, category, District, State, City) VALUES (?,?,?,?,?,?,?,?,?)`;
    db.query(query, [Name, Price, Description, zipCode, sellerEmail, category, district, state, city], function (err,result) {
        if (err) {
            console.log(err.message);
        } else {
            for (let image of images) {
                db.query(`INSERT INTO images (Image,ProductId) VALUES (?,?)`, [image, result.insertId], (err) => {
                    if (err) {
                        console.error(err.message);
                    }
                });
            }
        }
    });
}

// Anyone using this function must use await
export const addToWishlist = function (userEmail, productId) {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO wishlist (userEmail, productId) VALUES (?, ?)`;
        db.query(query, [userEmail, productId], function (err) {
            if (err) {
                if (err.message.includes("UNIQUE constraint failed")) {
                    return reject("Product is already in the wishlist");
                }
                return reject(err.message);
            }
            resolve("Added SuccessFully");
        });
    });
}

// Anyone using this function must use await
export const getWishlistProducts = function (userEmail) {
    return new Promise((resolve, reject) => {
        const query = `SELECT productId FROM wishlist WHERE userEmail = ?`;
        db.query(query, [userEmail], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

// Anyone using this function must use await
export const removeWishlistProduct = function (userEmail, productId) {
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM wishlist WHERE userEmail = ? AND productId = ?`;
        db.query(query, [userEmail, productId], (err) => {
            if (err) {
                console.log(err.message);
                reject(err.message);
            } else {
                resolve("Done");
            }
        });
    })
}

// Anyone using this function must use await
export const findUserByEmail = async (email) => {
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM users WHERE email=?`;
        db.query(query, [email], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row[0]);
            }
        });
    });
}

//PK ee 2 functions nuv vaadu
// Anyone using this function must use await
export const verifyProduct = async (productId) => {
    return new Promise((resolve, reject) => {
        const query = `UPDATE products SET verified = 1 where ProductId =?`;
        db.query(query, [productId], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve("verification Done");
            }
        });
    });
}

// Anyone using this function must use await
export const findProductsNotVerified = async () => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM products WHERE verified = 0 ORDER BY PostingDate`;
        db.query(query, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

export const createUser = (user) => {
    db.query(`INSERT INTO users(username,contact,email,password) VALUES (?,?,?,?)`, [user.username, user.contact, user.email, user.password], (err => {
        if (err) {
            console.error(err.message);
        }
        else {
            console.log("user insert done");
        }
    }));
};

// Anyone using this function must use await
export const findSellerByEmail = (email) => {
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM sellers WHERE email=?`;
        db.query(query, [email], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row[0]);
            }
        });
    });
}

export const createSeller = (seller) => {
    return new Promise((resolve, reject) => {
        db.query(`INSERT INTO sellers VALUES (?,?,?,?)`, [seller.username, seller.contact, seller.email, seller.password], (err => {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve("Done");
            }
        }));
    });
};


// Anyone using this function must use await
export const findProductsByCategory = async (category) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT ProductId FROM products where category = ?`;
        db.query(query, [category], async (err, rows) => {
            if (err) {
                console.log(err.message);
                reject(err);
            } else {
                let products = new Array();
                let product;
                for (let row of rows) {
                    product = await findProduct(row.ProductId);
                    products.push(product);
                }
                resolve(products);
            }
        });
    });
}
export const findSellersForAdmin = async () => {
    return new Promise((resolve, reject) => {
        let query = `SELECT username,contact,email,password,count(ProductId) AS numberOfProducts FROM sellers
        JOIN products ON sellers.email=products.SellerEmail
        GROUP BY email`;
        db.query(query, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                // console.log(rows);
                resolve(rows);
            }
        });
    });
}

export const findUsersForAdmin = async () => {
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM users`;
        db.query(query, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

export const removeSeller = async (email) => {
    return new Promise((resolve, reject) => {
        db.query(`DELETE FROM sellers WHERE email=?`, [email], (err) => {
            if (err) {
                // console.log(err.message);
                reject(err);
            } else {
                resolve("Deletion of Seller Done");
            }
        });
    });
}
export const removeProduct = async (productId) => {
    return new Promise((resolve, reject) => {
        let query = `DELETE FROM products WHERE ProductId=?`;
        db.query(query, [productId], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve("deletion done");
            }
        });
    });
}
//PK with seller email ivvu ee function ki products kosam also use await dont use try catch and make it complex
export const findProductsBySeller = async function (email) {
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM products WHERE SellerEmail=?`;
        db.query(query, [email], async (err, rows) => {
            if (err) {
                reject(err);
            } else {
                for (let row of rows) {
                    let Images = await findImages(row.ProductId);
                    for (let j = 0; j < Images.length; j++) {
                        row[`Image${j + 1}Src`] = Images[j].Image;
                    }
                }
                resolve(rows);
            }
        });
    });
}

export const updateBuyerPassword = async function (email, password) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE users SET password=? WHERE email=?`;
        db.query(query, [password, email], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve("password updated");
            }
        });
    });
}

export const updateSellerPassword = async function (email, password) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE sellers SET password=? WHERE email=?`;
        db.query(query, [password, email], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve("password updated");
            }
        });
    });
}

export const getRequestInfo = async (requestId) =>{
    return new Promise((resolve,reject)=>{
        let query=`SELECT * FROM requests JOIN products ON requests.productId=products.ProductId WHERE requestId =?`;
        db.query(query,[requestId],(err,rows)=>{
            if(err){
                reject(err);
            }else{
                resolve(rows[0]);
            }
        })
    });
}

export const acceptRequest = async function (userEmail,price,productId) {
    // let requestInfo= await getRequestInfo(requestId);
    return new Promise((resolve,reject)=>{
        let query=`UPDATE products SET SoldTo=?,Price=? WHERE ProductId=?`;
            db.query(query,[userEmail,price,productId],(err)=>{
                if(err){
                    reject(err);
                }else{
                    resolve("Acceptance Done");
                }
            });
    });
}

export const rejectRequest = async function (requestId){
    return new Promise((resolve,reject)=>{
        let query=`DELETE FROM requests WHERE requestId=?`;
        db.query(query,[requestId],(err)=>{
            if(err){
                reject(err);
            }else{
                resolve("rejection Done");
            }
        });
    });
}

export const addRequest = async function (userEmail,price,productId){
    return new Promise((resolve,reject)=>{
        let query=`INSERT INTO requests(userEmail,productId,Price) VALUES (?,?,?)`;
        db.query(query,[userEmail,productId,price],(err)=>{
            if(err){
                reject(err);
            }else{
                resolve("Adding Request Done");
            }
        });
    });
}
/*let products = [
    {
        Name: "BOUNCING SHOES FOR MEN",
        Price: "3000",
        Address: "guntur andhra pradesh,india",
        Description: "Size 8 \n Brandnew untouched",
        PostingDate: "4-march-2025",
        zipCode: 522003,
        // CountryCode: "IN",
        SellerEmail: "abc@gmail.com",
        ProductId: "3",
        Image1Src: "https://m.media-amazon.com/images/I/51u461LQQQL._SY695_.jpg",
        Image2Src: "https://m.media-amazon.com/images/I/51k80PiSIcL._SY695_.jpg",
        Image3Src: "https://m.media-amazon.com/images/I/613Np812kJL._SY695_.jpg",
        count: 0,
        distance: 0
    },
    {
        Name: "BOUNCING SHOES FOR MEN",
        Price: "3000",
        Address: "guntur andhra pradesh,india",
        Description: "Size 8 \n Brandnew untouched",
        PostingDate: "4-march-2025",
        zipCode: 522003,
        // CountryCode: "IN",
        SellerEmail: "abcd@gmail.com",
        ProductId: "4",
        Image1Src: "https://m.media-amazon.com/images/I/51u461LQQQL._SY695_.jpg",
        Image2Src: "https://m.media-amazon.com/images/I/51k80PiSIcL._SY695_.jpg",
        Image3Src: "https://m.media-amazon.com/images/I/613Np812kJL._SY695_.jpg",
        count: 0,
        distance: 0
    }, {
        Name: "BOUNCING SHOES FOR MEN",
        Price: "3000",
        Address: "guntur andhra pradesh,india",
        Description: "Size 8 \n Brandnew untouched",
        PostingDate: "4-march-2025",
        zipCode: 522003,
        // CountryCode: "IN",
        SellerEmail: "abcd@gmail.com",
        ProductId: "5",
        Image1Src: "https://m.media-amazon.com/images/I/51u461LQQQL._SY695_.jpg",
        Image2Src: "https://m.media-amazon.com/images/I/51k80PiSIcL._SY695_.jpg",
        Image3Src: "https://m.media-amazon.com/images/I/613Np812kJL._SY695_.jpg",
        count: 0,
        distance: 0
    }, {
        Name: "BOUNCING SHOES FOR MEN",
        Price: "3000",
        Address: "guntur andhra pradesh,india",
        Description: "Size 8 \n Brandnew untouched",
        PostingDate: "4-march-2025",
        zipCode: 522003,
        // CountryCode: "IN",
        SellerEmail: "abcd@gmail.com",
        ProductId: "6",
        Image1Src: "https://m.media-amazon.com/images/I/51u461LQQQL._SY695_.jpg",
        Image2Src: "https://m.media-amazon.com/images/I/51k80PiSIcL._SY695_.jpg",
        Image3Src: "https://m.media-amazon.com/images/I/613Np812kJL._SY695_.jpg",
        count: 0,
        distance: 0
    }, {
        Name: "BOUNCING SHOES FOR MEN",
        Price: "3000",
        Description: "Size 8 \n Brandnew untouched",
        PostingDate: "4-march-2025",
        zipCode: 522003,
        // CountryCode: "IN",
        SellerEmail: "abcd@gmail.com",
        ProductId: "7",
        Image1Src: "https://m.media-amazon.com/images/I/51u461LQQQL._SY695_.jpg",
        Image2Src: "https://m.media-amazon.com/images/I/51k80PiSIcL._SY695_.jpg",
        Image3Src: "https://m.media-amazon.com/images/I/613Np812kJL._SY695_.jpg",
        count: 0,
        distance: 0
    },{
        Name: "T-Shirt",
        Price: "3000",
        Description: "Size 8 \n Brandnew untouched",
        PostingDate: "4-march-2025",
        zipCode: 522003,
        // CountryCode: "IN",
        SellerEmail: "abcd@gmail.com",
        ProductId: "8",
        Image1Src: "https://fullyfilmy.in/cdn/shop/files/1_4_32af5fcd-7547-455c-ac64-4a0eb7bbc0a7.jpg?v=1710755206",
        Image2Src: "https://fullyfilmy.in/cdn/shop/files/1_4_32af5fcd-7547-455c-ac64-4a0eb7bbc0a7.jpg?v=1710755206",
        Image3Src: "https://fullyfilmy.in/cdn/shop/files/1_4_32af5fcd-7547-455c-ac64-4a0eb7bbc0a7.jpg?v=1710755206",
        count: 0,
        distance: 0
    },
    {
        Name: "Laptop",
        Price: "3000",
        Description: "Size 8 \n Brandnew untouched",
        PostingDate: "4-march-2025",
        zipCode: 522003,
        // CountryCode: "IN",
        SellerEmail: "abcd@gmail.com",
        ProductId: "9",
        Image1Src: "https://m.media-amazon.com/images/I/51OTzdpNAiL._AC_UF1000,1000_QL80_.jpg",
        Image2Src: "https://m.media-amazon.com/images/I/51OTzdpNAiL._AC_UF1000,1000_QL80_.jpg",
        Image3Src: "https://m.media-amazon.com/images/I/51OTzdpNAiL._AC_UF1000,1000_QL80_.jpg",
        count: 0,
        distance: 0
    }, {
        Name: "Headphones",
        Price: "3000",
        Description: "Size 8 \n Brandnew untouched",
        PostingDate: "4-march-2025",
        zipCode: 522003,
        // CountryCode: "IN",
        SellerEmail: "abcd@gmail.com",
        ProductId: "10",
        Image1Src: "https://m.media-amazon.com/images/I/61x3xPK2UUL.jpg",
        Image2Src: "https://m.media-amazon.com/images/I/61x3xPK2UUL.jpg",
        Image3Src: "https://m.media-amazon.com/images/I/61x3xPK2UUL.jpg",
        count: 0,
        distance: 0
    },
]*/