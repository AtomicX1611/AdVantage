import { createProduct } from "./src/daos/products.dao.js"
export const data=[
    {
    name: "OnePlus Nord 3",
    price: 34999,
    description: "5G smartphone with Dimensity 9000 chip and 120Hz AMOLED display.",
    postingDate: new Date(),
    zipCode: "110092",
    seller: '68ee39e574194f3881df4f6f',
    verified: false,
    category: "Mobiles",
    district: "East Delhi",
    city: "Assam",
    state: "Assam",
    invoice: "",
    images: [
        "https://m.media-amazon.com/images/I/6116+vSW+1L.jpg",
        "https://m.media-amazon.com/images/I/71-yDa90UrL._UF1000,1000_QL80_.jpg"

    ],
    requests: [],
    soldTo: null,
    isRental: true,
  },
  {
    name: "Apple iPad Air 5th Gen",
    price: 56999,
    description: "M1-powered tablet with 10.9-inch Liquid Retina display.",
    postingDate: new Date(),
    zipCode: "122018",
    seller: '68ee39e574194f3881df4f6f',
    verified: false,
    category: "Electronics",
    district: "Gurgaon",
    city: "Gurgaon",
    state: "Assam",
    invoice: "",
    images: [
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTin8AuPaDZ_bxCYvguu5BcdDN-AixKJmLZ0Q&s",
        "https://cdsassets.apple.com/live/SZLF0YNV/images/sp/111887_sp866-ipad-air-5gen.png",
        "https://m.media-amazon.com/images/I/61JREs56sTL._UF1000,1000_QL80_.jpg"

    ],
    requests: [],
    soldTo: null,
    isRental: false,
  },
  {
    name: "Adidas Backpack",
    price: 2499,
    description: "Durable and water-resistant backpack for daily use.",
    postingDate: new Date(),
    zipCode: "380006",
    seller: '68ee39e574194f3881df4f6f',
    verified: false,
    category: "Fashion",
    district: "Ahmedabad",
    city: "Ahmedabad",
    state: "Assam",
    invoice: "",
    images: [
      "https://assets.adidas.com/images/w_600,f_auto,q_auto/710c11ad417f4caf9ca3af3b010b2220_9366/Essentials_Linear_Backpack_Black_HT4746_01_00_standard.jpg",
      "https://assets.adidas.com/images/w_600,f_auto,q_auto/82e24958f6404f6e89f3a3b72986bf7e_9366/Essentials_3-Stripes_Performance_Backpack_Black_IP9878_01_standard.jpg"
    ],
    requests: [],
    soldTo: null,
    isRental: false,
  },
  {
    name: "MacBook Air M2",
    price: 134999,
    description: "Apple MacBook Air with M2 chip, 8GB RAM, and 256GB SSD.",
    postingDate: '2025-10-12T13:45:36.406+00:00',
    zipCode: "160001",
    seller: '68ee39e574194f3881df4f6f',
    verified: true,
    category: "Laptops",
    district: "Chandigarh",
    city: "Chandigarh",
    state: "Assam",
    invoice: "",
    images: [
      "https://rukminim2.flixcart.com/image/480/640/xif0q/computer/w/o/9/-original-imahfyyskvad3vpk.jpeg?q=90 ",
      "https://i.ytimg.com/vi/HTiBSG7E474/maxresdefault.jpg",
    ],
    requests: [],
    soldTo: null,
    isRental: false,
  }
]
export const seedData=async()=>{
    data.forEach(async(product)=>{
        await createProduct(product);
    });
}