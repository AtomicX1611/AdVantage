let users = [
    {
        username: "dummyUser1",
        email: "abc@gmail.com",
        password: "123"
    }
]

let sellers= [
    {
        username: "dummySeller1",
        email: "abc@gmail.com",
        password: "123"
    }
]
let products = [
    {
        Name: "ADIDAS BOUNCING SHOES FOR MEN",
        Price: "3000",
        Address: "guntur andhra pradesh,india",
        Description: "Size 8 \n Brandnew untouched",
        PostingDate: "4-march-2025",
        zipCode: 522003,
        CountryCode: "IN",
        Seller: "Ali the Hero",
        Image1Src: "./shoes1",
        Image2Src: "./shoes2",
        Image3Src: "./shoes3",
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
    console.log(location);
    let resjson = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=3c9477059b3e588e048325fb86c4fbea`);
    let resp = await resjson.json();
    console.log(resp);
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

/*
let returningProducts=new Array();
    let toBesearched=Name.split(" "),p1,matchCount;
    let locationcords=fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=3c9477059b3e588e048325fb86c4fbea`);//need to hide api key
    for(let i=0;i<toBesearched.length;i++){
        for(let j=0;j<products.length;j++){
            matchCount=0;
            pj=products[j].Name.split(" ");
            for(let k=0;k<pj.length;k++){
                if(toBesearched[i]==pj[k]){
                    matchCount++;
                }
            }
            if(matchCount>0){
               let productCords=fetch(`http://api.openweathermap.org/geo/1.0/zip?zip=${},IN&appid=3c9477059b3e588e048325fb86c4fbea`);
                
           }
        }
    }
*/
/*//searching with names
    let returningProducts = new Array(), count, prodWords;
    let locationcords={lat:0,lon:0}, productCords={lat:0,lon:0}, distanc;
    fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=3c9477059b3e588e048325fb86c4fbea`).then((res) => res.json()).then(function (res) {
        if (res.length == 0) {
            throw Error("invalid City");
        } else {
            locationcords.lat = res[0].lat;
            locationcords.lon = res[0].lon;
            products.forEach((product) => {
                count = 0;
                prodWords = product.Name.split(" ");
                prodWords.forEach((prodWord) => {
                    count += Name.includes(prodWord);
                });
                if (count > 0) {
                    fetch(`http://api.openweathermap.org/geo/1.0/zip?zip=${product.zipCode},${product.CountryCode}&appid=3c9477059b3e588e048325fb86c4fbea`).then((res) => res.json()).then(function (res) {
                        productCords.lat = res.lat;
                        productCords.lon = res.lon;
                        distanc = distance(locationcords.lat, productCords.lat, locationcords.lon, productCords.lan);
                        if (distanc < 150){
                            product.count = count;
                            product.distance = distanc;
                            let index1 = returningProducts.findIndex((element) => (element.count == product.count) && (element.distance > product.distance));
                            let index2 = returningProducts.findIndex((element) => (element.count < product.count));
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
                    });
                }
            });
        }
    }).catch((err) => {
        console.log(err);
        return returningProducts;
    }); */