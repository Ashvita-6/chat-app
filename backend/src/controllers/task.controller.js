// backend/src/controllers/task.controller.js
import Task from "../models/task.model.js";
import TaskComment from "../models/taskComment.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";
import { getChatUsers, areUsersInChatList, getChatUsersForTaskAssignment } from "../utils/chatUtils.js";

// Get all tasks with advanced filtering and pagination
export const getTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      assignedTo,
      assignedBy,
      search,
      tags,
      dueDate,
      overdue,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Priority filter
    if (priority) {
      const priorities = priority.split(',');
      filter.priority = { $in: priorities };
    }

    // Assigned to filter
    if (assignedTo) {
      const userIds = assignedTo.split(',');
      filter.assignedTo = { $in: userIds };
    }

    // Assigned by filter
    if (assignedBy) {
      filter.assignedBy = assignedBy;
    }

    // Tags filter
    if (tags) {
      const tagList = tags.split(',');
      filter.tags = { $in: tagList };
    }

    // Due date filter
    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const thisWeekEnd = new Date(today);
      thisWeekEnd.setDate(thisWeekEnd.getDate() + 7);
      const nextWeekEnd = new Date(today);
      nextWeekEnd.setDate(nextWeekEnd.getDate() + 14);

      switch (dueDate) {
        case 'today':
          filter.dueDate = {
            $gte: today,
            $lt: tomorrow
          };
          break;
        case 'tomorrow':
          filter.dueDate = {
            $gte: tomorrow,
            $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
          };
          break;
        case 'this-week':
          filter.dueDate = {
            $gte: today,
            $lte: thisWeekEnd
          };
          break;
        case 'next-week':
          filter.dueDate = {
            $gt: thisWeekEnd,
            $lte: nextWeekEnd
          };
          break;
        case 'overdue':
          filter.dueDate = { $lt: today };
          filter.status = { $ne: 'completed' };
          break;
      }
    }

    // Overdue filter
    if (overdue === 'true') {
      const now = new Date();
      filter.dueDate = { $lt: now };
      filter.status = { $ne: 'completed' };
    }

    // Search filter
    if (search) {
      filter.$text = { $search: search };
    }

    // Sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [tasks, totalTasks] = await Promise.all([
      Task.find(filter)
        .populate('assignedBy', 'fullName email profilePic')
        .populate('assignedTo', 'fullName email profilePic')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Task.countDocuments(filter)
    ]);

    // Get task statistics
    const stats = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const taskStats = {
      total: totalTasks,
      pending: stats.find(s => s._id === 'pending')?.count || 0,
      'in-progress': stats.find(s => s._id === 'in-progress')?.count || 0,
      completed: stats.find(s => s._id === 'completed')?.count || 0,
      cancelled: stats.find(s => s._id === 'cancelled')?.count || 0
    };

    res.status(200).json({
      success: true,
      data: {
        tasks,
        stats: taskStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalTasks / parseInt(limit)),
          totalTasks,
          hasNext: skip + tasks.length < totalTasks,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error("Error in getTasks:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Get single task by ID
export const getTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
      .populate('assignedBy', 'fullName email profilePic')
      .populate('assignedTo', 'fullName email profilePic');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });

  } catch (error) {
    console.error("Error in getTask:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Create new task
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      priority = 'medium',
      dueDate,
      tags,
      estimatedHours
    } = req.body;

    // Validation
    if (!title || !description || !assignedTo || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Title, description, assignedTo, and dueDate are required"
      });
    }

    if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one person must be assigned"
      });
    }

    // Validate due date
    if (new Date(dueDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Due date must be in the future"
      });
    }

    // Check if all assigned users are in the current user's chat list
    const areInChatList = await areUsersInChatList(req.user._id, assignedTo);
    if (!areInChatList) {
      return res.status(400).json({
        success: false,
        message: "You can only assign tasks to people you have chatted with"
      });
    }

    // Validate assigned users exist
    const users = await User.find({ _id: { $in: assignedTo } });
    if (users.length !== assignedTo.length) {
      return res.status(400).json({
        success: false,
        message: "One or more assigned users not found"
      });
    }

    // Create task
    const newTask = new Task({
      title,
      description,
      assignedBy: req.user._id,
      assignedTo,
      priority,
      dueDate: new Date(dueDate),
      tags: tags || [],
      estimatedHours
    });

    await newTask.save();

    // Populate the task
    await newTask.populate('assignedBy', 'fullName email profilePic');
    await newTask.populate('assignedTo', 'fullName email profilePic');

    // Emit socket event to assigned users
    assignedTo.forEach(userId => {
      const receiverSocketId = getReceiverSocketId(userId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("taskAssigned", {
          task: newTask,
          message: `You have been assigned a new task: ${title}`
        });
      }
    });

    res.status(201).json({
      success: true,
      data: newTask,
      message: "Task created successfully"
    });

  } catch (error) {
    console.error("Error in createTask:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Check permissions (only assigned users or creator can update)
    const canUpdate = task.assignedBy.toString() === req.user._id.toString() ||
                     task.assignedTo.some(userId => userId.toString() === req.user._id.toString());

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task"
      });
    }

    // Validate due date if being updated
    if (updates.dueDate && new Date(updates.dueDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Due date must be in the future"
      });
    }

    // Validate assigned users if being updated
    if (updates.assignedTo) {
      if (!Array.isArray(updates.assignedTo) || updates.assignedTo.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one person must be assigned"
        });
      }

      // Check if all assigned users are in the current user's chat list
      const areInChatList = await areUsersInChatList(req.user._id, updates.assignedTo);
      if (!areInChatList) {
        return res.status(400).json({
          success: false,
          message: "You can only assign tasks to people you have chatted with"
        });
      }

      const users = await User.find({ _id: { $in: updates.assignedTo } });
      if (users.length !== updates.assignedTo.length) {
        return res.status(400).json({
          success: false,
          message: "One or more assigned users not found"
        });
      }
    }

    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { ...updates },
      { new: true, runValidators: true }
    ).populate('assignedBy', 'fullName email profilePic')
     .populate('assignedTo', 'fullName email profilePic');

    // Emit socket event for task update
    const allUsers = [...task.assignedTo, task.assignedBy];
    const uniqueUsers = [...new Set(allUsers.map(id => id.toString()))];

    uniqueUsers.forEach(userId => {
      const receiverSocketId = getReceiverSocketId(userId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("taskUpdated", {
          task: updatedTask,
          updatedBy: req.user.fullName,
          message: `Task "${task.title}" has been updated`
        });
      }
    });

    res.status(200).json({
      success: true,
      data: updatedTask,
      message: "Task updated successfully"
    });

  } catch (error) {
    console.error("Error in updateTask:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Check permissions (only creator can delete)
    if (task.assignedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the task creator can delete this task"
      });
    }

    // Delete task and its comments
    await Promise.all([
      Task.findByIdAndDelete(taskId),
      TaskComment.deleteMany({ taskId })
    ]);

    // Emit socket event for task deletion
    const allUsers = [...task.assignedTo, task.assignedBy];
    const uniqueUsers = [...new Set(allUsers.map(id => id.toString()))];

    uniqueUsers.forEach(userId => {
      const receiverSocketId = getReceiverSocketId(userId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("taskDeleted", {
          taskId,
          taskTitle: task.title,
          deletedBy: req.user.fullName,
          message: `Task "${task.title}" has been deleted`
        });
      }
    });

    res.status(200).json({
      success: true,
      message: "Task deleted successfully"
    });

  } catch (error) {
    console.error("Error in deleteTask:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Get user's tasks
export const getUserTasks = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = {
      $or: [
        { assignedTo: userId },
        { assignedBy: userId }
      ]
    };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tasks, totalTasks] = await Promise.all([
      Task.find(filter)
        .populate('assignedBy', 'fullName email profilePic')
        .populate('assignedTo', 'fullName email profilePic')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        tasks,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalTasks / parseInt(limit)),
          totalTasks
        }
      }
    });

  } catch (error) {
    console.error("Error in getUserTasks:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Assign task to users
export const assignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one user ID is required"
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Check permissions
    if (task.assignedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the task creator can reassign this task"
      });
    }

    // Check if all users are in the current user's chat list
    const areInChatList = await areUsersInChatList(req.user._id, userIds);
    if (!areInChatList) {
      return res.status(400).json({
        success: false,
        message: "You can only assign tasks to people you have chatted with"
      });
    }

    // Validate users exist
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more users not found"
      });
    }

    // Update task
    task.assignedTo = userIds;
    await task.save();

    await task.populate('assignedBy', 'fullName email profilePic');
    await task.populate('assignedTo', 'fullName email profilePic');

    // Emit socket events
    userIds.forEach(userId => {
      const receiverSocketId = getReceiverSocketId(userId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("taskAssigned", {
          task,
          message: `You have been assigned to task: ${task.title}`
        });
      }
    });

    res.status(200).json({
      success: true,
      data: task,
      message: "Task assigned successfully"
    });

  } catch (error) {
    console.error("Error in assignTask:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Get available tags
export const getAvailableTags = async (req, res) => {
  try {
    const tags = await Task.distinct('tags');
    
    res.status(200).json({
      success: true,
      data: tags.filter(tag => tag && tag.trim())
    });

  } catch (error) {
    console.error("Error in getAvailableTags:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// Get chat users for task assignment
export const getChatUsersForTasks = async (req, res) => {
  try {
    const chatUsers = await getChatUsersForTaskAssignment(req.user._id);
    
    res.status(200).json({
      success: true,
      data: chatUsers,
      message: "Chat users retrieved successfully"
    });

  } catch (error) {
    console.error("Error in getChatUsersForTasks:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};