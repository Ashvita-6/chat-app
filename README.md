# Real-Time Chat & Task Management Application

A full-stack web application that seamlessly combines real-time messaging capabilities with comprehensive task management features. The platform enables users to communicate instantly through private conversations while simultaneously managing project tasks, assignments, and team collaboration all within a unified interface.

The chat system provides real-time messaging between users with Socket.IO integration, allowing for instant message delivery and live user presence indicators. Users can share images through Cloudinary integration, maintain conversation history, and see when other team members are online or offline. The messaging interface is intuitive and responsive, supporting both desktop and mobile interactions.

The task management component offers a complete project management solution where users can create detailed tasks with titles, descriptions, priority levels (Low, Medium, High, Urgent), and due dates. Tasks can be assigned to multiple team members simultaneously, with real-time notifications sent to all assigned users. The system tracks task status through a comprehensive workflow including Pending, In-Progress, Completed, and Cancelled states. Users can organize tasks using custom tags, search and filter tasks based on various criteria including status, priority, assigned users, and due dates. The platform also includes time tracking capabilities with estimated versus actual hours, task analytics, and automated overdue detection.

Authentication is handled through a secure JWT-based system with bcrypt password hashing, ensuring user data protection and session management. The application features a modern, responsive user interface built with Tailwind CSS and DaisyUI components, offering multiple theme options with persistent user preferences. Real-time updates are implemented throughout the application, ensuring that chat messages, task updates, user presence, and notifications are instantly synchronized across all connected clients without requiring page refreshes.

The backend architecture utilizes Express.js with MongoDB for data persistence, implementing RESTful APIs for all core functionalities. Socket.IO handles bidirectional real-time communication for both chat messages and task updates. The frontend is built with React using Zustand for efficient state management, React Router for navigation, and Axios for API communication. The application is designed for production deployment with static file serving through the Express backend, making it suitable for single-domain hosting solutions.

## Technology Stack

**Backend Technologies:**
Node.js, Express.js, MongoDB, Mongoose, Socket.IO, JWT (JSON Web Tokens), bcryptjs, Cloudinary, Multer, Express Validator, CORS, Cookie Parser, dotenv

**Frontend Technologies:**
React, Zustand, React Router DOM, Axios, Tailwind CSS, DaisyUI, Lucide React, Socket.IO Client

**Development & Build Tools:**
Vite, Nodemon, ESLint

**Deployment:**
Render

## How to Run

### Prerequisites
- Node.js (version 16 or higher)
- MongoDB database (local or cloud)
- Cloudinary account for image uploads

### Backend Setup

1. Clone the repository and navigate to the backend directory:
```bash
git clone https://github.com/yourusername/chat-task-app.git
cd chat-task-app/backend
```

2. Install all backend dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following environment variables:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=5000
NODE_ENV=development
```

4. Start the backend development server:
```bash
npm run dev
```

The backend server will start running on `http://localhost:5000`.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install all frontend dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm run dev
```

The frontend application will start running on `http://localhost:5173`.

### Production Build

To build the application for production deployment:

1. Build the frontend application:
```bash
cd frontend
npm run build
```

2. Copy the built files to the backend public directory:
```bash
cp -r dist/* ../backend/public/
```

3. Start the production server:
```bash
cd ../backend
npm start
```

The application will serve both the API and the frontend from a single domain, typically running on the PORT specified in your environment variables.
