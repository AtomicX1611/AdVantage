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

  const [productImages, setProductImages] = useState([]);
  const [invoiceFile, setInvoiceFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    setProductImages(e.target.files);
  };

  const handleInvoiceChange = (file) => {
    setInvoiceFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.name.trim().length == 0) {
      alert("Name cannot be empty");
      return;
    }
    if (true) {
      let ch = formData.name.charAt(0);
      if (!isNaN(ch)) {
        alert("Product name cannot start with a number");
        return;
      }
    }
    if (formData.description.trim().length <= 20) {
      alert("Description should be atleast 20 characters long");
      return;
    }

    if (formData.state === "default") {
      alert("Please select your state");
      return;
    }
    if (formData.district.trim().length < 3) {
      alert("District Name should be atleast 3 character long");
      return;
    }
    if (!isNaN(formData.district.charAt(0))) {
      alert("District name cannot start with number");
      return;
    }
    if (formData.city.trim().length < 3) {
      alert("City name should be atleast 3 character long");
      return;
    }
    if (!isNaN(formData.city.charAt(0))) {
      alert("City name cannot start with number");
      return;
    }
    if (!(formData.zipCode >= 100000 && formData.zipCode < 10000000)) {
      alert("Invalid Zipcode");
      return;
    }

    if (formData.category == "default") {
      alert("Select category of your product");
      return;
    }
    if (formData.price.trim().length == 0) {
      alert("Enter price for the product");
      return;
    }
    if (formData.price < 0) {
      alert("Price cannot be negative");
      return;
    }
    if (productImages.length === 0) {
      alert("Upload at least one image!");
      return;
    }

    const formDataToSend = new FormData();

    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });
    console.log(Array.from(productImages));
    Array.from(productImages).forEach((file) => {
      formDataToSend.append("productImages", file);
    });

    if (invoiceFile) {
      formDataToSend.append("invoice", invoiceFile);
    }

    const request = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/addProduct`, {
      method: "POST",
      credentials: "include",
      body: formDataToSend
    });

    const response = await request.json();
    if (!response.success) {
      alert(response.message || response.error);
    } else {
      window.location.href = "/seller/";
    }
  };

  return (
    <form method="post" id="formElement" className={styles.formElement}>
      <a href="/seller"><img src="/Assets/Logo.svg" alt="Logo" id={styles.logo} draggable="false" /></a>

      <div className={styles.parent}>
        <GeneralInfo formData={formData} handleChange={handleChange} />
        <AddressSection formData={formData} handleChange={handleChange} />
        <ImageUploader handleFileChange={handleFileChange} />
        <InvoiceUploader handleInvoiceChange={handleInvoiceChange} />
        <PriceSection formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} />
      </div>
    </form>
  );
};

export default AddProductForm;
