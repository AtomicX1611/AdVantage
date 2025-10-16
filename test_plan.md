# test_plan.md - Product Management Comprehensive Test Plan

## 1. Authentication Test Cases

### 1.1 User Login

| Case | Input | Expected Result | Actual Result | Status | Screenshot |
| :--- | :--- | :--- | :--- | :--- | :--- |
| *Valid* | Email: abc@gmail.com, Password: [valid password] | User successfully authenticated | Redirects to user dashboard | Passed | ![Valid Login](Login%20valid%20.png) |
| *Invalid* | Email: abcgmail.com, Password: [any password] | Error message: "Invalid email, Email ID should contain '@'" | Red error message displayed | Passed | ![Invalid Login](Login%20invalid%20.png) |

### 1.2 User Sign Up

| Case | Input | Expected Result | Actual Result | Status | Screenshot |
| :--- | :--- | :--- | :--- | :--- | :--- |
| *Invalid - Empty Username* | Email: abc@gmail.com, Username: [empty], Contact No: [any], Password: [any], Confirm Password: [any] | Error message: "Username cannot be empty!" | Red error message displayed | Passed | ![Empty Username](Username.png) |
| *Invalid - Email Format* | Email: invalid-email, Username: [any], Contact No: [any], Password: [any], Confirm Password: [any] | Error message: "Invalid email, Email ID should contain '@'" | Red error message displayed | Passed | ![Invalid Email](singupInvalid.png) |
| *Invalid - Contact Number* | Email: abc@gmail.com, Username: abc, Contact No: 1234567890, Password: [any], Confirm Password: [any] | Error message: "Please enter a valid 10-digit mobile number or 11-digit landline number" | Red error message displayed | Passed | ![Invalid Contact](ContactValidation.png) |
| *Invalid - Email Exists* | Email: abc@gmail.com, Username: Gamer, Contact No: 656565656532, Password: [any], Confirm Password: [different] | Multiple errors:<br>- "This Email ID already Exist"<br>- "Passwords do not Match" | Both error messages displayed | Passed | ![Email Exists](EmailExists.png) |

---

## 2. Add Product Form Test Cases

### 2.1 Product Name Validation

| Case | Input | Expected Result | Actual Result | Status | Screenshot |
| :--- | :--- | :--- | :--- | :--- | :--- |
| *Invalid* | Product Name: [empty], Description: [any], Category: [any], Address: [any], Images: [any], Price: [any] | Error message: "Name cannot be empty" | Red error message displayed | Passed | ![Empty Product Name](Add%20Product%20Name%20validatin.png) |
| *Valid* | Product Name: iPhone 16 pro, Description: [valid], Category: [valid], Address: [valid], Images: [valid], Price: [valid] | Product name accepted | No validation error | Passed | ![Valid Product Name](Add%20Product%20correct%20validation.png) |

### 2.2 Product Description Validation

| Case | Input | Expected Result | Actual Result | Status | Screenshot |
| :--- | :--- | :--- | :--- | :--- | :--- |
| *Invalid* | Product Name: iPhone 16 pro, Description: [less than 20 chars], Category: [any], Address: [any], Images: [any], Price: [any] | Error message: "Description should be atleast 20 characters long" | Red error message displayed | Passed | ![Short Description](Add%20Product%20Description%20validation.png) |
| *Valid* | Product Name: iPhone 16, Description: "Brand new iPhone 16 with 93% battery health and full condition 1 year old", Category: Mobiles, Address: [valid], Images: [valid], Price: 3000 | Description accepted | No validation error | Passed | ![Valid Description](Add%20Product%20correct%20validation.png) |

### 2.3 Product Category Validation

| Case | Input | Expected Result | Actual Result | Status | Screenshot |
| :--- | :--- | :--- | :--- | :--- | :--- |
| *Invalid* | Product Name: iPhone 16 pro, Description: [valid], Category: [not selected], Address: [any], Images: [any], Price: [any] | Error message: "Select category of your product" | Red error message displayed | Passed | ![Empty Category](Add%20Product%20category%20validation.png) |
| *Valid* | Product Name: iPhone 16, Description: [valid], Category: Mobiles, Address: [valid], Images: [valid], Price: 3000 | Category accepted | No validation error | Passed | ![Valid Category](Add%20Product%20correct%20validation.png) |

### 2.4 Address Validation

| Case | Input | Expected Result | Actual Result | Status | Screenshot |
| :--- | :--- | :--- | :--- | :--- | :--- |
| *Invalid - State* | Product Name: iPhone 16 pro, Description: [valid], Category: Movies, Address: State: [not selected], Images: [any], Price: [any] | Error message: "Please select your state" | Red error message displayed | Passed | ![Empty State](Add%20Product%20address%20validation.png) |
| *Invalid - District* | Product Name: iPhone 16 pro, Description: [valid], Category: Mobiles, Address: State: Archra Pradesh, District: [less than 3 chars], Images: [any], Price: [any] | Error message: "District Name should be atleast 3 character long" | Red error message displayed | Passed | ![Invalid District](Add%20Product%20address%20validation%202%20png.png) |
| *Valid* | Product Name: iPhone 16, Description: [valid], Category: Mobiles, Address: State: Andina Pradesh, District: Guntur, City: Guntur, Zipcode: 522801, Images: [valid], Price: 3000 | Address accepted | No validation error | Passed | ![Valid Address](Add%20Product%20correct%20validation.png) |

### 2.5 Image Upload Validation

| Case | Input | Expected Result | Actual Result | Status | Screenshot |
| :--- | :--- | :--- | :--- | :--- | :--- |
| *Invalid* | Product Name: iPhone 16 pro, Description: [valid], Category: [any], Address: [any], Images: [no image], Price: [any] | Error message: "Upload atleast one image of your product!" | Red error message displayed | Passed | ![No Images](Add%20Product%20images%20%20validation.png) |
| *Valid* | Product Name: iPhone 16, Description: [valid], Category: Mobiles, Address: [valid], Images: [at least one image], Price: 3000 | Images accepted | No validation error | Passed | ![Valid Images](Add%20Product%20correct%20validation.png) |

### 2.6 Price Validation

| Case | Input | Expected Result | Actual Result | Status | Screenshot |
| :--- | :--- | :--- | :--- | :--- | :--- |
| *Invalid* | Product Name: iPhone 16 pro, Description: [valid], Category: Mobiles, Address: [valid], Images: [any], Price: [empty] | Error message: "Enter price for the product" | Red error message displayed | Passed | ![Empty Price](Add%20Product%20Invalid%20.png) |
| *Valid* | Product Name: iPhone 16, Description: [valid], Category: Mobiles, Address: [valid], Images: [valid], Price: 3000 | Price accepted | No validation error | Passed | ![Valid Price](Add%20Product%20correct%20validation.png) |

### 2.7 Complete Valid Product Submission

| Case | Input | Expected Result | Actual Result | Status | Screenshot |
| :--- | :--- | :--- | :--- | :--- | :--- |
| *Valid* | Product Name: iPhone 16, Description: "Brand new iPhone 16 with 93% battery health and full condition 1 year old", Category: Mobiles, Address: State: Andina Pradesh, District: Guntur, City: Guntur, Zipcode: 522801, Images: [uploaded], Price: 3000 | Product successfully added | Form submits without errors, product created | Passed | ![Complete Valid Product](Add%20Product%20correct%20validation.png) |

---

## 3. Async Test Cases

### 3.1 Rent Request Management

| Case | Action | Endpoint | Request Type | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| *Buyer Rent Request* | Buyer sends rent request for product | `/buyer/rent/68ebda10c5f85dbea9534d03` | PUT | Request successfully sent, status: 200 OK | Request accepted with proper response | Passed |
| *Seller Rejects Request* | Seller rejects buyer's rent request | `/seller/rejectRequest/68ebda10c5f85dbea9534d03/68eb7de195c4690b4d9fbdd2` | DELETE | Request successfully rejected, buyer notified | Request rejected with proper status | Passed |
| *Seller Accepts Request* | Seller accepts buyer's rent request | `/seller/acceptRequest/[productId]/[buyerId]` | PUT | Request accepted, rental agreement created | Rental agreement created successfully | Passed |

### 3.2 Accept and Reject Request Flow

| Case | Scenario | Request Details | Headers | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| *Seller Rejects Rent Request* | Seller rejects buyer's rent request with valid token | DELETE `/seller/rejectRequest/68ebda10c5f85dbea9534d03/68eb7de195c4690b4d9fbdd2` | Content-Type: application/json<br>Cookie: valid seller token | Request rejected successfully, buyer notified | Proper rejection response, status 200 | Passed |
| *Seller Accepts Rent Request* | Seller accepts buyer's rent request | PUT `/seller/acceptRequest/[productId]/[buyerId]` | Content-Type: application/json<br>Cookie: valid seller token | Request accepted, rental agreement created | Rental created successfully | Passed |
| *Invalid Token Rejection* | Seller tries to reject with invalid token | DELETE `/seller/rejectRequest/[productId]/[buyerId]` | Cookie: invalid/expired token | 401 Unauthorized response | Proper error response received | Passed |
| *CORS Validation* | Cross-origin request from frontend | Any seller endpoint | Origin: http://localhost:3001 | CORS headers properly set | Access-Control-Allow-Origin set correctly | Passed |

### 3.3 API Authentication & Headers

| Case | Scenario | Headers | Cookies | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| *Valid Seller Token* | Request with valid seller JWT token | Content-Type: application/json | token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... | Request processed successfully | 200 OK response received | Passed |
| *Role-Based Access* | Seller accessing seller endpoints | Standard headers | role: seller | Access granted to seller resources | Proper authorization | Passed |
| *Browser Compatibility* | Request from Chrome browser | User-Agent: Chrome/141.0.0.0 | Standard cookies | Request processed normally | No browser-specific issues | Passed |

---

## 4. Test Case Summary

### 4.1 Overall Status
- *Total Test Cases*: 20
- *Passed*: 20
- *Failed*: 0
- *Pending*: 0
- *Success Rate*: 100%

### 4.2 Functional Areas Covered
1. *User Authentication* (Login & Sign Up)
2. *Product Management* (Add Product Form)
3. *Form Validation* (All field validations)
4. *Address Management* (State, District, City, Zipcode)
5. *Rental System* (Rent requests and management)
6. *API Integration* (Async operations and endpoints)
7. *Seller Workflow* (Accept/Reject rent requests)

### 4.3 Validation Types Tested
- ✅ Required Field Validation
- ✅ Email Format Validation
- ✅ Minimum Length Validation
- ✅ Contact Number Validation
- ✅ Category Selection Validation
- ✅ Image Upload Validation
- ✅ Price Validation
- ✅ Address Field Validation
- ✅ API Endpoint Validation
- ✅ JWT Token Validation
- ✅ CORS Configuration
- ✅ Role-Based Access Control
- ✅ Rent Request Workflow

---

## 5. Test Environment Details

- *Application*: Product Management System
- *Frontend*: Localhost (Port 3001)
- *Backend API*: Localhost (Port 3000)
- *Browser*: Chrome 141.0.0.0
- *Test Data*: Various product scenarios and rental requests
- *Authentication*: JWT tokens with role-based access
- *Screenshot Directory*: Project root folder

## 6. Notes & Observations

1. All form validations are working correctly with appropriate error messages
2. Error messages are clear and user-friendly
3. Success scenarios redirect appropriately
4. File upload validation is properly implemented
5. Address field validation covers all required fields
6. Category selection validation ensures proper product categorization
7. API endpoints properly handle rent requests with JWT authentication
8. CORS configuration correctly allows requests from frontend (localhost:3001)
9. Rental request flow (request → accept/reject) works seamlessly
10. Token-based authentication is properly implemented across all endpoints
11. Seller role can successfully accept/reject rent requests
12. DELETE method properly handles rent request rejections
13. All API requests include proper security headers and CORS configuration

---
Last Updated: October 12, 2025  
Test Plan Version: 1.2