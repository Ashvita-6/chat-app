# 💬 Real-Time Chat & 📋 Task Management Application

A full-stack web application that seamlessly combines real-time messaging with comprehensive task management 📂 features. Users can chat instantly while managing project tasks, assignments, and team collaboration — all in one place.

The chat system supports real-time messaging using Socket.IO, with live presence indicators, image sharing via Cloudinary, and conversation history.  
The task management system allows creating tasks with priorities (Low, Medium, High, Urgent), assigning to multiple users, tracking progress (Pending, In-Progress, Completed, Cancelled), and managing deadlines with notifications and overdue detection.

Authentication is handled using JWT 🔐 with bcrypt password hashing. The modern, responsive UI is built with Tailwind CSS and DaisyUI, with multiple themes and persistent preferences. Real-time updates ensure chats, tasks, presence, and notifications stay in sync without refreshes.

---

## 🛠 Technology Stack

| **Category**          | **Technologies** |
|-----------------------|------------------|
| **Backend**           | Node.js, Express.js, MongoDB, Mongoose, Socket.IO, JWT, bcryptjs, Cloudinary, Multer, Express Validator, CORS, Cookie Parser, dotenv |
| **Frontend**          | React, Zustand, React Router DOM, Axios, Tailwind CSS, DaisyUI, Lucide React, Socket.IO Client |
| **Dev & Build Tools** | Vite, Nodemon, ESLint |
| **Deployment**        | Render |

---

## 🚀 How to Run

### Backend Setup
```bash
git clone https://github.com/yourusername/chat-task-app.git
cd chat-task-app/backend
npm install
```
Create a .env file in the backend directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=5000
NODE_ENV=development
```
Start the backend:

```bash
npm run dev
```
Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

📦 Production Build
```bash
cd frontend
npm run build
cp -r dist/* ../backend/public/
cd ../backend
npm start
```
The app will serve both the API and the frontend from a single domain.
