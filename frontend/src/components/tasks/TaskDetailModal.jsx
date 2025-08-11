import { useState } from "react";
import { 
  X, 
  Calendar, 
  User, 
  Clock, 
  Tag, 
  AlertTriangle, 
  CheckSquare, 
  Edit, 
  Trash2,
  AlertCircle,
  MessageSquare
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

const TaskDetailModal = ({ 
  task, 
  onClose, 
  onUpdate, 
  onDelete, 
  onEdit,
  getPriorityColor, 
  getStatusColor,
  hideEditButton = false,
  hideDeleteButton = false,
  isReadOnly = false
}) => {
  const { authUser } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);

  // Add safety check for task
  if (!task) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-4xl p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Task Not Found</h2>
            <p className="text-base-content/70 mb-4">The task data could not be loaded.</p>
            <button onClick={onClose} className="btn btn-primary">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "No date set";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "No date set";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleStatusChange = async (newStatus) => {
    if (!onUpdate) return;
    
    setIsUpdating(true);
    try {
      await onUpdate(task._id, { status: newStatus });
    } catch (error) {
      console.error("Failed to update task status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    if (!onDelete) return;
    
    if (window.confirm("Are you sure you want to delete this task?")) {
      onDelete(task._id);
      onClose();
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
      onClose(); // Close the detail modal when opening edit form
    }
  };

  // Safe property access with fallbacks
  const taskTitle = task.title || "Untitled Task";
  const taskDescription = task.description || "No description provided";
  const taskPriority = task.priority || "medium";
  const taskStatus = task.status || "pending";
  const taskTags = task.tags || [];
  const taskAssignedTo = task.assignedTo || [];
  const taskAssignedBy = task.assignedBy || { fullName: "Unknown", email: "" };
  const taskDueDate = task.dueDate;
  const taskCreatedAt = task.createdAt;

  // Check permissions with safe property access
  const canEdit = authUser && taskAssignedBy._id && taskAssignedBy._id === authUser._id && !hideEditButton && onEdit;
  const canDelete = authUser && taskAssignedBy._id && taskAssignedBy._id === authUser._id && !hideDeleteButton && onDelete;
  const canUpdateStatus = authUser && onUpdate && (
    (taskAssignedBy._id && taskAssignedBy._id === authUser._id) || 
    (taskAssignedTo.some && taskAssignedTo.some(user => user._id === authUser._id))
  ) && !isReadOnly;

  const daysUntilDue = getDaysUntilDue(taskDueDate);
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "urgent": return "badge-error";
      case "high": return "badge-warning";
      case "medium": return "badge-info";
      case "low": return "badge-success";
      default: return "badge-ghost";
    }
  };

  console.log("TaskDetailModal - Task data:", task); // Debug log

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-base-300">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-base-content truncate">{taskTitle}</h1>
              <span className={`badge ${getPriorityBadgeClass(taskPriority)} badge-sm`}>
                {taskPriority.toUpperCase()}
              </span>
              <span className={`badge ${getStatusColor ? getStatusColor(taskStatus) : 'badge-ghost'} badge-sm`}>
                {taskStatus.charAt(0).toUpperCase() + taskStatus.slice(1).replace('-', ' ')}
              </span>
            </div>
            
            {/* Quick Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/70">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>Created by {taskAssignedBy.fullName || "Unknown"}</span>
              </div>
              {taskCreatedAt && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDateTime(taskCreatedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 ml-4">
            {canEdit && (
              <button
                className="btn btn-outline btn-sm gap-2"
                onClick={handleEdit}
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            {canDelete && (
              <button
                className="btn btn-error btn-outline btn-sm gap-2"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-base-content mb-3">Description</h3>
                <div className="bg-base-200 rounded-lg p-4">
                  <p className="text-base-content/80 leading-relaxed whitespace-pre-wrap">
                    {taskDescription}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {taskTags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-base-content mb-3 flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {taskTags.map((tag, index) => (
                      <span key={index} className="badge badge-outline">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div>
                <h3 className="text-lg font-semibold text-base-content mb-3">Quick Actions</h3>
                {canUpdateStatus ? (
                  <div className="flex flex-wrap gap-2">
                    {taskStatus !== 'pending' && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleStatusChange('pending')}
                        disabled={isUpdating}
                      >
                        Mark as Pending
                      </button>
                    )}
                    {taskStatus !== 'in-progress' && (
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => handleStatusChange('in-progress')}
                        disabled={isUpdating}
                      >
                        Start Progress
                      </button>
                    )}
                    {taskStatus !== 'completed' && (
                      <button
                        className="btn btn-success btn-sm gap-2"
                        onClick={() => handleStatusChange('completed')}
                        disabled={isUpdating}
                      >
                        <CheckSquare className="w-4 h-4" />
                        Mark Complete
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-base-content/50 text-sm">
                    You can only view this task
                  </div>
                )}
              </div>

              {/* Comments Section (Placeholder) */}
              <div>
                <h3 className="text-lg font-semibold text-base-content mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Comments
                </h3>
                <div className="bg-base-200 rounded-lg p-4 text-center">
                  <p className="text-base-content/50">
                    Comments feature coming soon...
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Due Date */}
              <div className="bg-base-200 rounded-lg p-4">
                <h4 className="font-medium text-base-content mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </h4>
                <div className="space-y-2">
                  {taskDueDate ? (
                    <>
                      <p className={`font-medium ${
                        isOverdue ? 'text-error' : 
                        isDueSoon ? 'text-warning' : 
                        'text-base-content'
                      }`}>
                        {formatDate(taskDueDate)}
                      </p>
                      {isOverdue && (
                        <div className="flex items-center gap-2 text-error">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {Math.abs(daysUntilDue)} days overdue
                          </span>
                        </div>
                      )}
                      {isDueSoon && !isOverdue && (
                        <div className="flex items-center gap-2 text-warning">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Due in {daysUntilDue} day{daysUntilDue === 1 ? '' : 's'}
                          </span>
                        </div>
                      )}
                      {!isOverdue && !isDueSoon && (
                        <span className="text-sm text-base-content/70">
                          {daysUntilDue} days remaining
                        </span>
                      )}
                    </>
                  ) : (
                    <p className="text-base-content/50">No due date set</p>
                  )}
                </div>
              </div>

              {/* Assigned Users */}
              <div className="bg-base-200 rounded-lg p-4">
                <h4 className="font-medium text-base-content mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Assigned To ({taskAssignedTo.length})
                </h4>
                <div className="space-y-3">
                  {taskAssignedTo.length === 0 ? (
                    <p className="text-base-content/50">No users assigned</p>
                  ) : (
                    taskAssignedTo.map((user) => (
                      <div key={user._id} className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {user.profilePic ? (
                              <img src={user.profilePic} alt={user.fullName} className="w-full h-full rounded-full" />
                            ) : (
                              <span className="text-sm font-medium text-primary">
                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-base-content">{user.fullName || "Unknown User"}</p>
                          <p className="text-sm text-base-content/70">{user.email || "No email"}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Priority */}
              <div className="bg-base-200 rounded-lg p-4">
                <h4 className="font-medium text-base-content mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Priority
                </h4>
                <div className="flex items-center gap-2">
                  <span className={`badge ${getPriorityBadgeClass(taskPriority)}`}>
                    {taskPriority.toUpperCase()}
                  </span>
                  <span className={`text-sm ${getPriorityColor ? getPriorityColor(taskPriority) : 'text-base-content'}`}>
                    {taskPriority.charAt(0).toUpperCase() + taskPriority.slice(1)} Priority
                  </span>
                </div>
              </div>

              {/* Task Timeline */}
              <div className="bg-base-200 rounded-lg p-4">
                <h4 className="font-medium text-base-content mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timeline
                </h4>
                <div className="space-y-3">
                  {taskCreatedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-base-content">Task Created</p>
                        <p className="text-xs text-base-content/70">{formatDateTime(taskCreatedAt)}</p>
                      </div>
                    </div>
                  )}
                  
                  {taskStatus === 'in-progress' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-base-content">In Progress</p>
                        <p className="text-xs text-base-content/70">Currently being worked on</p>
                      </div>
                    </div>
                  )}
                  
                  {taskStatus === 'completed' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-base-content">Completed</p>
                        <p className="text-xs text-base-content/70">Task finished successfully</p>
                      </div>
                    </div>
                  )}
                  
                  {taskDueDate && (
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        isOverdue ? 'bg-error' : 'bg-base-300'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-base-content">Due Date</p>
                        <p className={`text-xs ${
                          isOverdue ? 'text-error' : 'text-base-content/70'
                        }`}>
                          {formatDateTime(taskDueDate)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;