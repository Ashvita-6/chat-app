// backend/src/controllers/taskComment.controller.js
import TaskComment from "../models/taskComment.model.js";
import Task from "../models/task.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";

// Get comments for a task
export const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Check if user has access to this task
    const hasAccess = task.assignedBy.toString() === req.user._id.toString() ||
                     task.assignedTo.some(userId => userId.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view comments for this task"
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [comments, totalComments] = await Promise.all([
      TaskComment.find({ taskId })
        .populate('userId', 'fullName email profilePic')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      TaskComment.countDocuments({ taskId })
    ]);

    res.status(200).json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalComments / parseInt(limit)),
          totalComments
        }
      }
    });

  } catch (error) {
    console.error("Error in getTaskComments:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Add comment to task
export const addTaskComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment is required"
      });
    }

    // Check if task exists and user has access
    const task = await Task.findById(taskId)
      .populate('assignedBy', 'fullName email profilePic')
      .populate('assignedTo', 'fullName email profilePic');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    const hasAccess = task.assignedBy._id.toString() === req.user._id.toString() ||
                     task.assignedTo.some(user => user._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to comment on this task"
      });
    }

    // Handle file uploads if present
    let attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "task_comments",
            resource_type: "auto"
          });

          attachments.push({
            url: result.secure_url,
            filename: file.originalname,
            size: file.size,
            mimeType: file.mimetype
          });
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError);
          return res.status(500).json({
            success: false,
            message: "Error uploading file"
          });
        }
      }
    }

    // Create comment
    const newComment = new TaskComment({
      taskId,
      userId: req.user._id,
      comment: comment.trim(),
      attachments
    });

    await newComment.save();
    await newComment.populate('userId', 'fullName email profilePic');

    // Emit socket event to all users involved in the task
    const allUsers = [task.assignedBy._id, ...task.assignedTo.map(user => user._id)];
    const uniqueUsers = [...new Set(allUsers.map(id => id.toString()))];

    uniqueUsers.forEach(userId => {
      if (userId !== req.user._id.toString()) { // Don't send to the commenter
        const receiverSocketId = getReceiverSocketId(userId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("taskCommentAdded", {
            comment: newComment,
            task: { _id: task._id, title: task.title },
            commenter: req.user.fullName,
            message: `${req.user.fullName} commented on task: ${task.title}`
          });
        }
      }
    });

    res.status(201).json({
      success: true,
      data: newComment,
      message: "Comment added successfully"
    });

  } catch (error) {
    console.error("Error in addTaskComment:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Update comment
export const updateTaskComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment is required"
      });
    }

    const existingComment = await TaskComment.findById(commentId);
    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Check if user owns the comment
    if (existingComment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this comment"
      });
    }

    // Update comment
    existingComment.comment = comment.trim();
    await existingComment.save();

    await existingComment.populate('userId', 'fullName email profilePic');

    // Get task details for socket emission
    const task = await Task.findById(existingComment.taskId)
      .populate('assignedBy', '_id')
      .populate('assignedTo', '_id');

    // Emit socket event
    const allUsers = [task.assignedBy._id, ...task.assignedTo.map(user => user._id)];
    const uniqueUsers = [...new Set(allUsers.map(id => id.toString()))];

    uniqueUsers.forEach(userId => {
      if (userId !== req.user._id.toString()) {
        const receiverSocketId = getReceiverSocketId(userId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("taskCommentUpdated", {
            comment: existingComment,
            task: { _id: task._id, title: task.title },
            updater: req.user.fullName
          });
        }
      }
    });

    res.status(200).json({
      success: true,
      data: existingComment,
      message: "Comment updated successfully"
    });

  } catch (error) {
    console.error("Error in updateTaskComment:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Delete comment
export const deleteTaskComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await TaskComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Check if user owns the comment or is the task creator
    const task = await Task.findById(comment.taskId);
    const canDelete = comment.userId.toString() === req.user._id.toString() ||
                     task.assignedBy.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment"
      });
    }

    // Delete attachments from cloudinary
    if (comment.attachments && comment.attachments.length > 0) {
      for (const attachment of comment.attachments) {
        try {
          const publicId = attachment.url.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`task_comments/${publicId}`);
        } catch (deleteError) {
          console.error("Error deleting attachment:", deleteError);
        }
      }
    }

    await TaskComment.findByIdAndDelete(commentId);

    // Emit socket event
    const allUsers = [task.assignedBy, ...task.assignedTo];
    const uniqueUsers = [...new Set(allUsers.map(id => id.toString()))];

    uniqueUsers.forEach(userId => {
      if (userId !== req.user._id.toString()) {
        const receiverSocketId = getReceiverSocketId(userId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("taskCommentDeleted", {
            commentId,
            taskId: task._id,
            taskTitle: task.title,
            deleter: req.user.fullName
          });
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully"
    });

  } catch (error) {
    console.error("Error in deleteTaskComment:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};