// backend/src/models/task.model.js
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    assignedTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }],
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled"],
      default: "pending"
    },
    dueDate: {
      type: Date,
      required: true,
      validate: {
        validator: function(value) {
          return value > new Date();
        },
        message: "Due date must be in the future"
      }
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: 50
    }],
    attachments: [{
      url: {
        type: String,
        required: true
      },
      filename: {
        type: String,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      mimeType: {
        type: String,
        required: true
      }
    }],
    completedAt: {
      type: Date,
      default: null
    },
    estimatedHours: {
      type: Number,
      min: 0,
      max: 1000
    },
    actualHours: {
      type: Number,
      min: 0,
      max: 1000
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status !== 'completed';
});

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function() {
  const today = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Indexes for better query performance
taskSchema.index({ assignedBy: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ tags: 1 });

// Text index for search functionality
taskSchema.index({ 
  title: "text", 
  description: "text", 
  tags: "text" 
});

// Middleware to set completedAt when status changes to completed
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'completed') {
      this.completedAt = null;
    }
  }
  next();
});

// Middleware to validate assignedTo array
taskSchema.pre('save', function(next) {
  if (this.assignedTo.length === 0) {
    next(new Error('At least one person must be assigned to the task'));
  }
  next();
});

const Task = mongoose.model("Task", taskSchema);

export default Task;