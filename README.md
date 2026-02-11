# AdVantage

**AdVantage** is a **student-focused reselling platform** designed to build **communities within colleges**.  
It allows outgoing students (pass-outs) to **resell or hand down their belongings** — such as books, electronics, or essentials — to juniors.  
The goal is to promote **sustainability, affordability**, and **connection among students** of the same institution.

---

## Project Structure

This project adopts a client-server architecture:

- **`backend/`**: Node.js & Express.js server (Active).
- **`client/`**: React.js frontend using Vite (Active).
- **`frontend/`**: Legacy/Deprecated frontend folder (Not in use).

---

## Installation Guide

### Prerequisites

- [Node.js](https://nodejs.org/) (version 16 or higher recommended).
- [Git](https://git-scm.com/).
- [MongoDB](https://www.mongodb.com/) (Local or Atlas connection string).

---

### Setup Instructions

#### 1. Clone the repository
```sh
git clone https://github.com/yourusername/AdVantage.git
cd AdVantage
```

#### 2. Backend Setup
Navigate to the backend folder, install dependencies, and start the server.

```sh
cd backend

# Install dependencies
npm install

# Create a .env file in the backend/ directory and configure:
# PORT=5000
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# ... (any other required env vars)

# Start the server (Development mode)
npm run dev
```
The backend server runs typically on `http://localhost:5000` (or the PORT defined in your .env).

#### 3. Client Setup
Open a new terminal, navigate to the client folder, install dependencies, and start the frontend.

```sh
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```
The application will be accessible at `http://localhost:5173`.

---

## Usage

1. Ensure MongoDB is running or your Atlas connection is valid.
2. Start the Backend server first.
3. Start the Client development server.
4. Open `http://localhost:5173` in your browser.

---

## Tech Stack

- **Frontend:** React, Vite, Redux Toolkit, TailwindCSS/CSS.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose).
- **Authentication:** JWT (JSON Web Tokens).
- **Real-time:** Socket.io (for chat features).
