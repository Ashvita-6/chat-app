// backend/src/models/taskComment.model.js
import mongoose from "mongoose";

const taskCommentSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
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
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date,
      default: null
    }
  },
  { 
    timestamps: true 
  }
);

// Indexes for better query performance
taskCommentSchema.index({ taskId: 1, createdAt: -1 });
taskCommentSchema.index({ userId: 1 });

// Middleware to set edit tracking
taskCommentSchema.pre('save', function(next) {
  if (this.isModified('comment') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

const TaskComment = mongoose.model("TaskComment", taskCommentSchema);

export default TaskComment;