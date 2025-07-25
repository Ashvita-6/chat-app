// backend/src/lib/socket.js - Updated version that maintains your existing structure
import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

// used to store online users
const userSocketMap = {}; // {userId: socketId}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    
    // Join user to their personal room for task notifications
    socket.join(`user_${userId}`);
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ===== TASK-RELATED SOCKET EVENTS =====
  
  // Join task room for real-time task updates
  socket.on("joinTaskRoom", (taskId) => {
    socket.join(`task_${taskId}`);
    console.log(`User ${userId} joined task room: task_${taskId}`);
  });

  // Leave task room
  socket.on("leaveTaskRoom", (taskId) => {
    socket.leave(`task_${taskId}`);
    console.log(`User ${userId} left task room: task_${taskId}`);
  });

  // Join user's task list room
  socket.on("joinUserTasksRoom", () => {
    socket.join(`user_tasks_${userId}`);
    console.log(`User ${userId} joined their tasks room`);
  });

  // Leave user's task list room
  socket.on("leaveUserTasksRoom", () => {
    socket.leave(`user_tasks_${userId}`);
    console.log(`User ${userId} left their tasks room`);
  });

  // Task status update in real-time
  socket.on("taskStatusUpdate", (data) => {
    const { taskId, status, updatedBy } = data;
    
    // Broadcast to all users in the task room
    socket.to(`task_${taskId}`).emit("taskStatusChanged", {
      taskId,
      status,
      updatedBy,
      timestamp: new Date()
    });
  });

  // Task assignment notification
  socket.on("notifyTaskAssignment", (data) => {
    const { assignedUsers, taskTitle, assignedBy } = data;
    
    assignedUsers.forEach(userId => {
      const receiverSocketId = getReceiverSocketId(userId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("taskAssignmentNotification", {
          message: `You have been assigned to task: ${taskTitle}`,
          assignedBy,
          timestamp: new Date()
        });
      }
    });
  });

  // Task comment typing indicator
  socket.on("taskCommentTyping", (data) => {
    const { taskId, userName, isTyping } = data;
    
    socket.to(`task_${taskId}`).emit("userTypingTaskComment", {
      taskId,
      userName,
      isTyping,
      userId
    });
  });

  // Bulk task operations
  socket.on("bulkTaskUpdate", (data) => {
    const { taskIds, operation, updatedBy } = data;
    
    taskIds.forEach(taskId => {
      socket.to(`task_${taskId}`).emit("taskBulkUpdated", {
        taskId,
        operation,
        updatedBy,
        timestamp: new Date()
      });
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    if (userId) {
      delete userSocketMap[userId];
      socket.leave(`user_${userId}`);
      socket.leave(`user_tasks_${userId}`);
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Helper functions for task-related socket events
export const emitToTaskRoom = (taskId, event, data) => {
  io.to(`task_${taskId}`).emit(event, data);
};

export const emitToUserTasksRoom = (userId, event, data) => {
  io.to(`user_tasks_${userId}`).emit(event, data);
};

export const emitTaskNotification = (userIds, event, data) => {
  userIds.forEach(userId => {
    const socketId = getReceiverSocketId(userId);
    if (socketId) {
      io.to(socketId).emit(event, data);
    }
  });
};

// Task-specific notification types
export const TASK_EVENTS = {
  TASK_CREATED: 'taskCreated',
  TASK_UPDATED: 'taskUpdated',
  TASK_DELETED: 'taskDeleted',
  TASK_ASSIGNED: 'taskAssigned',
  TASK_STATUS_CHANGED: 'taskStatusChanged',
  TASK_COMMENT_ADDED: 'taskCommentAdded',
  TASK_COMMENT_UPDATED: 'taskCommentUpdated',
  TASK_COMMENT_DELETED: 'taskCommentDeleted',
  TASK_DUE_REMINDER: 'taskDueReminder',
  TASK_OVERDUE: 'taskOverdue'
};

export { io, app, server };