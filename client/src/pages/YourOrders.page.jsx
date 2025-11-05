// src/pages/MyOrders.jsx
import React from "react";
import OrderHeader from "../components/OrderHeader.component";
import ProductList from "../components/ProductList";
import styles from "../styles/myorders.module.css";

const MyOrders = () => {
  const backendURL = "https://www.google.com/imgres?q=ai%20photo%20image&imgurl=https%3A%2F%2Fendertech.com%2F_next%2Fimage%3Furl%3Dhttps%253A%252F%252Fimages.ctfassets.net%252Ffswbkokbwqb5%252F4vBAsCbQ9ITwI7Ym0MtXgY%252F96c4ec25d505f1b702f46a5a3d9dbe77%252FAI-Article-00.png%26w%3D3840%26q%3D75&imgrefurl=https%3A%2F%2Fendertech.com%2Fblog%2F6-ways-to-identify-ai-generated-images-with-examples&docid=uG2baxG9BPY3TM&tbnid=Xv5o4o3Ebe7XNM&vet=12ahUKEwj69sX1ptqQAxUn2DgGHdkVESQQM3oECBkQAA..i&w=1920&h=1080&hcb=2&ved=2ahUKEwj69sX1ptqQAxUn2DgGHdkVESQQM3oECBkQAA";
  const userProducts = [
    {
      _id: "1",
      name: "Wireless Headphones",
      price: 2499,
      images: ["https://en.wikipedia.org/wiki/Image#/media/File:Image_created_with_a_mobile_phone.png"],
    },
    {
      _id: "2",
      name: "Bluetooth Speaker",
      price: 1599,
      images: ["https://en.wikipedia.org/wiki/Image#/media/File:Image_created_with_a_mobile_phone.png"],
    },
    {
      _id: "3",
      name: "Smart Watch",
      price: 3299,
      images: ["https://en.wikipedia.org/wiki/Image#/media/File:Image_created_with_a_mobile_phone.png"],
    },
  ];

  return (
    <div className={styles.window}>
      <OrderHeader />
      <div className={styles['main-container']}>
        <ProductList userProducts={userProducts} backendURL={backendURL} />
      </div>
    </div>
  );
};

export default MyOrders;
