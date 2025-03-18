import sqlite3 from "sqlite3";

const db = new sqlite3.Database(":memory:", (err) => {
    if (err) {
        console.error("Error connecting to in-memory SQLite:", err.message);
    } else {
        console.log("Connected to in-memory SQLite database.");
    }
});
db.run(
    `CREATE TABLE IF NOT EXISTS wishlist (
        userId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        UNIQUE(productId, userId)
    )`,
    (err) => {
        if (err) {
            console.error("Error creating table:", err.message);
        } else {
            console.log("Wishlist table created in memory.");
        }
    }
);
export let users = [
    {
        username: "abc",
        email: "abc@gmail.com",
        password: "123",
        role : "buyer",
        userId: "1"
    },
    {
        username: "SK",
        email: "sk@gmail.com",
        password: "123",
        role : "buyer",
        userId:"2"
    }
]

let userCount = 2;

let sellers = [
    {
        username: "dummySeller1",
        email: "abc@gmail.com",
        password: "123",
        SellerId: "1",
        Name: "Ali the Hero",
        Contact: "0123456789",
    },
    {
        username: "dummySeller2",
        email: "abcd@gmail.com",
        password: "123",
        SellerId: "2",
        Name: "PK (Nak koncham tikkundhi)",
        Contact: "9876543210"
    }
]

let sellerCount = 2;

let products = [
    {
        Name: "BOUNCING SHOES FOR MEN",
        Price: "3000",
        Address: "Guntur andhra pradesh,india",
        Description: "Size 8\nBrand new, untouched, Canteen purchased ,\nNo package box,\nNo bill,\nStill Never used",
        PostingDate: "4-march-2025",
        zipCode: 522003,
        // CountryCode: "IN",
        SellerId: "1",
        ProductId: "1",
        Image1Src: "https://m.media-amazon.com/images/I/51u461LQQQL._SY695_.jpg",
        Image2Src: "https://m.media-amazon.com/images/I/51k80PiSIcL._SY695_.jpg",
        Image3Src: "https://m.media-amazon.com/images/I/613Np812kJL._SY695_.jpg",
        count: 0,
        distance: 0
    },
    {
        Name: "shoes man",
        Price: "3000",
        Address: "guntur andhra pradesh,india",
        Description: "Size 8 \n Brandnew untouched",
        PostingDate: "4-march-2025",
        zipCode: 522003,
        // CountryCode: "IN",
        SellerId: "2",
        ProductId: "2",
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
        SellerId: "1",
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
        SellerId: "2",
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
        SellerId: "2",
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
        SellerId: "2",
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
        SellerId: "2",
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
        SellerId: "2",
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
        SellerId: "2",
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
        SellerId: "2",
        ProductId: "10",
        Image1Src: "https://m.media-amazon.com/images/I/61x3xPK2UUL.jpg",
        Image2Src: "https://m.media-amazon.com/images/I/61x3xPK2UUL.jpg",
        Image3Src: "https://m.media-amazon.com/images/I/61x3xPK2UUL.jpg",
        count: 0,
        distance: 0
    },
]
export let prodid = { value: 10 };

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

//distance between 2 points on earth
function distance(lat1, lat2, lon1, lon2) {
    lon1 = lon1 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);
    let c = 2 * Math.asin(Math.sqrt(a));
    let r = 6378;
    return (c * r);
}
export const findProducts = async function (Name, location) {
    let returningProducts = new Array();
    let locationCords = { lat: 0, lon: 0 }, productCords = { lat: 0, lon: 0 };
    // console.log(location);
    let resjson = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=3c9477059b3e588e048325fb86c4fbea`);
    let resp = await resjson.json();
    // console.log("hello "+resp);
    let count, productWords, index1, index2, dist;
    if (resp.length == 0) {
        return returningProducts;
    }
    locationCords.lat = resp[0].lat; locationCords.lon = resp[0].lon;
    for (let product of products) {
        count = 0;
        productWords = product.Name.split(" ");
        productWords.forEach((productWord) => {
            count += Name.toLowerCase().includes(productWord.toLowerCase());
        });
        if (count > 0) {
            resjson = await fetch(`http://api.openweathermap.org/geo/1.0/zip?zip=${product.zipCode},IN&appid=3c9477059b3e588e048325fb86c4fbea`);
            resp = await resjson.json();
            productCords.lat = resp.lat; productCords.lon = resp.lon;
            dist = distance(locationCords.lat, productCords.lat, locationCords.lon, productCords.lon);
            if (dist < 150) {
                product.count = count;
                product.distance = dist;
                index1 = returningProducts.findIndex((element) => (element.count == product.count) && (element.distance > product.distance));
                index2 = returningProducts.findIndex((element) => (element.count < product.count));
                if (index1 == -1) {
                    if (index2 == -1) {
                        returningProducts.push(product);
                    } else {
                        returningProducts.splice(index2, 0, product);
                    }
                } else {
                    returningProducts.splice(index1, 0, product);
                }
            }
        }
    }
    return returningProducts;
}
export const findProduct = function (prodId) {
    for (let product of products) {
        if (product.ProductId == prodId) {
            return product;
        }
    }
}
export const addProduct = function (Name, Price, Address, Description, zipCode, currProdId, sellerEmail, imageNames) {
    const seller = findSellerByEmail(sellerEmail);
    let product = {
        Name: Name,
        Price: Price,
        Address: Address,
        Description: Description,
        zipCode: zipCode,
        SellerId: `${seller.SellerId}`,
        ProductId: `${currProdId}`
    }
    for (let i = 0; i < imageNames.length; i++) {
        product[`Image${i + 1}Src`] = `/Assets/products/${currProdId}/${imageNames[i]}`;

    }
    products.push(product);
    console.log(product);
}

export const addToWishlist = function (userEmail, productId) {
    return new Promise((resolve, reject) => {
        let userId = findUserByEmail(userEmail).userId;
        const query = `INSERT INTO wishlist (userId, productId) VALUES (?, ?)`;
        db.run(query, [userId, productId], function (err) {
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
        let user = findUserByEmail(userEmail);
        if (!user) {
            return reject(new Error("User not found"));
        }

        const userId = user.userId;
        const query = `SELECT productId FROM wishlist WHERE userId = ?`;

        db.all(query, [userId], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

export const removeWishlistProduct = function (userEmail, productId) {
    return new Promise((resolve, reject) => {
        let user = findUserByEmail(userEmail);
        const userId = user.userId;
        const query = `DELETE FROM wishlist WHERE userId = ? AND productId = ?`;
        db.run(query, [userId, productId], (err) => {
            if (err) {
                console.log(err.message);
                reject(err.message);
            } else {
                resolve("Done");
            }
        });
    })
}

export const findUserByEmail = (email) => {
    return users.find((user) => user.email === email);
}

export const createUser = (user) => {
    //add id here before pushing
    user.userId = `${++userCount}`;
    users.push(user);
    console.log("updated users list: ", users);
    return user;
};

export const findSellerByEmail = (email) => {
    return sellers.find((seller) => seller.email === email);
}

export const createSeller = (seller) => {
    //add id here before pushing
    seller.userId = `${++sellerCount}`;
    sellers.push(seller);
    console.log("updated sellers list: ", sellers);
    return seller;
};