let users = [
    {
        username: "dummyUser1",
        email: "abc@gmail.com",
        password: "123"
    }
]
let sellers=[
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
let products = [
    {
        Name: "BOUNCING SHOES FOR MEN",
        Price: "3000",
        Address: "Guntur andhra pradesh,india",
        Description: "Size 8\nBrand new, untouched, Canteen purchased ,\nNo package box,\nNo bill,\nStill Never used",
        PostingDate: "4-march-2025",
        zipCode: 522003,
        CountryCode: "IN",
        SellerId: "1",
        ProductId:"1",
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
        CountryCode: "IN",
        SellerId: "2",
        ProductId:"2",
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
        CountryCode: "IN",
        SellerId: "1",
        ProductId:"3",
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
        CountryCode: "IN",
        SellerId: "2",
        ProductId:"4",
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
        CountryCode: "IN",
        SellerId: "2",
        ProductId:"4",
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
        CountryCode: "IN",
        SellerId: "2",
        ProductId:"4",
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
        CountryCode: "IN",
        SellerId: "2",
        ProductId:"4",
        Image1Src: "https://m.media-amazon.com/images/I/51u461LQQQL._SY695_.jpg",
        Image2Src: "https://m.media-amazon.com/images/I/51k80PiSIcL._SY695_.jpg",
        Image3Src: "https://m.media-amazon.com/images/I/613Np812kJL._SY695_.jpg",
        count: 0,
        distance: 0
    }
]

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
            resjson = await fetch(`http://api.openweathermap.org/geo/1.0/zip?zip=${product.zipCode},${product.CountryCode}&appid=3c9477059b3e588e048325fb86c4fbea`);
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
export const findProduct= function(prodId) {
    for(let product of products){
        if(product.ProductId==prodId){
            return product;
        }
    }
}
export const findUserByEmail = (email) => {
    return users.find((user) => user.email === email);
}

export const createUser = (user) => {
    users.push(user);
    return user;
};

export const findSellerByEmail = (email) => {
    return sellers.find((seller) => seller.email === email);
}

export const createSeller = (seller) => {
    sellers.push(seller);
    return seller;
};