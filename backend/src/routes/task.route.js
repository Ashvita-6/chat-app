// backend/src/routes/task.route.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getUserTasks,
  assignTask,
  getAvailableTags
} from "../controllers/task.controller.js";
import {
  getTaskComments,
  addTaskComment,
  updateTaskComment,
  deleteTaskComment
} from "../controllers/taskComment.controller.js";

const router = express.Router();

// Task routes
router.get("/", protectRoute, getTasks);
router.get("/tags", protectRoute, getAvailableTags);
router.get("/:taskId", protectRoute, getTask);
router.get("/user/:userId", protectRoute, getUserTasks);

router.post("/", protectRoute, createTask);
router.put("/:taskId", protectRoute, updateTask);
router.delete("/:taskId", protectRoute, deleteTask);
router.put("/:taskId/assign", protectRoute, assignTask);

// Comment routes
router.get("/:taskId/comments", protectRoute, getTaskComments);
router.post("/:taskId/comments", protectRoute, upload.array("attachments", 5), addTaskComment);
router.put("/comments/:commentId", protectRoute, updateTaskComment);
router.delete("/comments/:commentId", protectRoute, deleteTaskComment);

export default router;