# 🚀 Real-Time Full-Stack Chat Application

A slick, fully-loaded chat app — packed with real-time messaging, secure auth, image uploads, and a sleek UI. 

---

## 📝 Project Description

A real-time chat app with a focus on security, performance, and user experience. It's features are:

- **Secure Authentication:** Implemented JWT-based login with bcrypt password hashing to keep user data safe.
- **Real-Time Communication:** Powered by Socket.IO, enabling instant messaging and live online presence updates.
- **Rich Media Support:** Integrated Cloudinary for efficient image upload and delivery.
- **Modern Frontend:** Built with React, styled using Tailwind CSS and Daisy UI , the app has a full responsive design.
- **Global State Management:** Used Zustand for clean and efficient handling of app state.
- **Backend:** Node.js, Express, and MongoDB for RESTful API and data storage.
- **Deployment:** Served React frontend statically through Express backend, deployed as a single domain app for simplicity and reliability.

---

## 🛠️ Tech Stack

| Category         | Technologies                                |
|------------------|---------------------------------------------|
| Backend          | Node.js, Express, MongoDB, Mongoose, JWT, bcrypt |
| Real-Time        | Socket.IO                                   |
| Frontend         | React, Zustand, React Router, Axios         |
| Styling          | Tailwind CSS, Daisy UI                       |
| Media Storage    | Cloudinary                                  |
| Deployment       | Render (Single domain hosting)               |

---

## 🚀 How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

### 2. Setup Backend
```bash
cd backend
npm install
```

### 3.Create a .env file in the backend/ directory with your environment variables:
```ini
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=5000
```

### 4.Start backend server:
```bash
npm run dev
```

### 5.Setup and start frontend
```bash
cd frontend
npm install
npm run dev
```
