import sqlite3 from "sqlite3";

const db = new sqlite3.Database(":memory:", (err) => {
    if (err) {
        console.error("Error connecting to in-memory SQLite:", err.message);
    } else {
        console.log("Connected to in-memory SQLite database.");
    }
});

db.run(
    `CREATE TABLE IF NOT EXISTS products (
        Name TEXT NOT NULL,
        Price INTEGER NOT NULL,
        Address TEXT NOT NULL,
        Description TEXT NOT NULL,
        PostingDate DATE DEFAULT CURRENT_DATE,
        zipCode INTEGER NOT NULL,
        SellerEmail TEXT NOT NULL,
        ProductId TEXT PRIMARY KEY
    )`,(err)=>{
        if(err){
            console.error(err.message);
        }else{
            console.log("products table created successfully");
            //as the below tables are referencing the above table
            db.run(
                `CREATE TABLE IF NOT EXISTS images(
                    ProductId TEXT,
                    Image TEXT,
                    FOREIGN KEY (ProductId) REFERENCES products (ProductId) ON DELETE CASCADE
                )`,(err)=>{
                    if(err){
                        console.error(err.message);
                    }else{
                        console.log("images table created successfully");
                    }
                }
            );
            db.run(
                `CREATE TABLE IF NOT EXISTS wishlist (
                    userEmail INTEGER NOT NULL,
                    productId INTEGER NOT NULL,
                    UNIQUE(productId, userEmail),
                    FOREIGN KEY (productId) REFERENCES products (ProductId) ON DELETE CASCADE
                )`,
                (err) => {
                    if (err) {
                        console.error("Error creating table:", err.message);
                    } else {
                        console.log("wishlist table created in memory.");
                    }
                }
            );
        }
    }
);
db.run(
    `CREATE TABLE IF NOT EXISTS users(
        email TEXT,
        password TEXT
    )`,(err)=>{
        if(err){
            console.log(err.message);
        }else{
            console.log("users table created in memory.");
        }
    }
);
db.run(
    `CREATE TABLE IF NOT EXISTS sellers(
        email TEXT,
        password TEXT
    )`,(err)=>{
        if(err){
            console.log(err.message);
        }else{
            console.log("users table created in memory.");
        }
    }
);
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
    }
]*/


/*let sellers = [
    {
        username: "dummySeller1",
        email: "abc@gmail.com",
        password: "123",
        Name: "Ali",
        Contact: "0123456789",
    },
    {
        username: "dummySeller2",
        email: "abcd@gmail.com",
        password: "123",
        Name: "PK",
        Contact: "9876543210"
    }
]*/

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
export let prodid = { value: 0 };

export const freshProducts = [
    { name: "Product 1", image: "https://m.media-amazon.com/images/I/51u461LQQQL._SY695_.jpg",ProductId : "2" },
    { name: "Product 2", image: "https://m.media-amazon.com/images/I/51u461LQQQL._SY695_.jpg" ,ProductId : "2"},
    { name: "Product 3", image: "https://m.media-amazon.com/images/I/51u461LQQQL._SY695_.jpg",ProductId : "2" },
    { name: "Product 4", image: "https://m.media-amazon.com/images/I/51OTzdpNAiL._AC_UF1000,1000_QL80_.jpg",ProductId : "9" },
    { name: "Product 5", image: "https://m.media-amazon.com/images/I/61x3xPK2UUL.jpg",ProductId : "10" },
    { name: "Product 6", image: "",ProductId : "2" },
    { name: "Product 7", image: "",ProductId : "2" },
    { name: "Product 8", image: "",ProductId : "2" },
  ];


  export const featuredProducts = [
    { name: "Product 1", image: "https://m.media-amazon.com/images/I/51u461LQQQL._SY695_.jpg",ProductId : "2" },
    { name: "Product 2", image: "https://m.media-amazon.com/images/I/51u461LQQQL._SY695_.jpg",ProductId : "2" },
    { name: "Product 3", image: "https://m.media-amazon.com/images/I/51u461LQQQL._SY695_.jpg",ProductId : "2" },
    { name: "Product 4", image: "https://fullyfilmy.in/cdn/shop/files/1_4_32af5fcd-7547-455c-ac64-4a0eb7bbc0a7.jpg?v=1710755206",ProductId : "8"},
    { name: "Product 5", image: "",ProductId : "2" },
    { name: "Product 6", image: "",ProductId : "2" },
    { name: "Product 7", image: "",ProductId : "2" },
    { name: "Product 8", image: "",ProductId : "2" },
  ];

const findImages =async function(prodId){
    return new Promise((resolve,reject) =>{
        let query=`SELECT Image FROM images WHERE ProductId=?`;
        db.all(query,[prodId],(err,rows)=>{
            if(err){
                reject(err);
            }else{
                resolve(rows);
            }
        });
    });
}
export const findProducts = async function (Name) {
    return new Promise((resolve, reject) => {
        let names=Name.split(" ");
        let bestMatchCondition = names.map(() => "(Name LIKE ?)").join("+");
        let query = `SELECT *, (${bestMatchCondition}) AS best_match FROM products WHERE best_match != 0 ORDER BY best_match DESC`;
        let params = names.map(nam => `%${nam}%`);
        db.all(query,params,async (err,rows)=>{
            if(err){
                console.log(err.message);
                reject("error");
            }else{
                let Images;
                for(let i=0;i<rows.length;i++){
                    Images=await findImages(rows[i].ProductId);
                    for(let j=0;j<Images.length;j++){
                        rows[i][`Image${j+1}Src`]=Images[j].Image;
                    }
                }
                resolve(rows);
            }
        }); 
    });
}
export const findProduct = function (prodId) {
    return new Promise((resolve,reject)=>{
        let query=`SELECT * FROM products WHERE ProductId = ?`
        db.get(query,[prodId],async (err,row)=>{
            if(err){
                reject(err);
            }else{
                let Images=await findImages(row.ProductId);
                    for(let j=0;j<Images.length;j++){
                        row[`Image${j+1}Src`]=Images[j].Image;
                    }
                resolve(row);
                console.log(row);
            }
        })
    });
}
export const addProduct = function (Name, Price, Address, Description, zipCode, currProdId, sellerEmail, images) {
    let query=`INSERT INTO products (Name, Price, Address, Description, zipCode, sellerEmail, ProductId) VALUES (?,?,?,?,?,?,?)`;
    db.run(query,[Name, Price, Address, Description, zipCode, sellerEmail, currProdId],(err)=>{
        if(err){
            console.log(err.message);
        }else{
            for(let image of images){
                db.run(`INSERT INTO images (Image,ProductId) VALUES (?,?)`,[image,currProdId],(err)=>{
                    if(err){
                        console.error(err.message);
                    }
                });
            }
            // console.log("hi broo");
            // findProduct(currProdId);
        }
    });
}

export const addToWishlist = function (userEmail, productId) {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO wishlist (userEmail, productId) VALUES (?, ?)`;
        db.run(query, [userEmail, productId], function (err) {
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

export const getWishlistProducts = function (userEmail) {
    return new Promise((resolve, reject) => {
        const query = `SELECT productId FROM wishlist WHERE userEmail = ?`;
        db.all(query, [userEmail], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

export const removeWishlistProduct = function (userEmail, productId) {
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM wishlist WHERE userEmail = ? AND productId = ?`;
        db.run(query, [userEmail, productId], (err) => {
            if (err) {
                console.log(err.message);
                reject(err.message);
            } else {
                resolve("Done");
            }
        });
    })
}

export const findUserByEmail = async (email) => {
    return new Promise((resolve,reject)=>{
        let query=`SELECT * FROM users WHERE email=?`;
        db.get(query,[email],(err,row)=>{
            if(err){
                reject(err);
            }else{
                resolve(row);
            }
        });
    });
}

export const createUser = (user) => {
    db.run(`INSERT INTO users VALUES (?,?)`,[user.email,user.password],(err=>{
        if(err){
            console.error(err.message);
        }
        console.log("insert done");
    }));
};

export const findSellerByEmail = (email) => {
    return new Promise((resolve,reject)=>{
        let query=`SELECT * FROM sellers WHERE email=?`;
        db.get(query,[email],(err,row)=>{
            if(err){
                reject(err);
            }else{
                resolve(row);
            }
        });
    });
}

export const createSeller = (seller) => {
    db.run(`INSERT INTO sellers VALUES (?,?)`,[seller.email,seller.password],(err=>{
        if(err){
            console.error(err.message);
        }
    }));
};