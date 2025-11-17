import React, { useState } from "react";
import GeneralInfo from "../components/AddProduct/GeneralInfo";
import AddressSection from "../components/AddProduct/AddressSection";
import ImageUploader from "../components/AddProduct/ImageUploader";
import InvoiceUploader from "../components/AddProduct/InvoiceUploader";
import PriceSection from "../components/AddProduct/PriceSection";
import styles from "../styles/Addproductform.module.css";

const AddProductForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "default",
    state: "default",
    district: "",
    city: "",
    zipCode: "",
    isRental: false,
    price: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = () => {}; // handled in uploader

  const handleSubmit = async (event) => {
    event.preventDefault();

    // add your same validation logic from EJS here
    // then send formData via fetch

    alert("Product added successfully!");
  };

  return (
    <form method="post" id="formElement" className={styles.formElement}>
      <a href="/seller"><img src="/Assets/Logo.svg" alt="Logo" id={styles.logo} draggable="false" /></a>

      <div className={styles.parent}>
        <GeneralInfo formData={formData} handleChange={handleChange} />
        <AddressSection formData={formData} handleChange={handleChange} />
        <ImageUploader handleFileChange={handleFileChange} />
        <InvoiceUploader />
        <PriceSection formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} />
      </div>
    </form>
  );
};

export default AddProductForm;
