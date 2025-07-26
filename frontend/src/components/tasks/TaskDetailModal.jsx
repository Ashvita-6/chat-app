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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
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
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleStatusChange = async (newStatus) => {
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
    if (window.confirm("Are you sure you want to delete this task?")) {
      onDelete(task._id);
      onClose();
    }
  };

  const daysUntilDue = getDaysUntilDue(task.dueDate);
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-base-300">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-base-content">{task.title}</h1>
              <span className={`badge ${getPriorityBadgeClass(task.priority)} badge-sm`}>
                {task.priority.toUpperCase()}
              </span>
              <span className={`badge ${getStatusColor(task.status)} badge-sm`}>
                {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
              </span>
            </div>
            
            {/* Quick Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/70">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>Created by {task.assignedBy.fullName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDateTime(task.createdAt)}</span>
              </div>
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
                    {task.description}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-base-content mb-3 flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
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
                    {task.status !== 'pending' && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleStatusChange('pending')}
                        disabled={isUpdating}
                      >
                        Mark as Pending
                      </button>
                    )}
                    {task.status !== 'in-progress' && (
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => handleStatusChange('in-progress')}
                        disabled={isUpdating}
                      >
                        Start Progress
                      </button>
                    )}
                    {task.status !== 'completed' && (
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
                  <p className={`font-medium ${
                    isOverdue ? 'text-error' : 
                    isDueSoon ? 'text-warning' : 
                    'text-base-content'
                  }`}>
                    {formatDate(task.dueDate)}
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
                </div>
              </div>

              {/* Assigned Users */}
              <div className="bg-base-200 rounded-lg p-4">
                <h4 className="font-medium text-base-content mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Assigned To ({task.assignedTo.length})
                </h4>
                <div className="space-y-3">
                  {task.assignedTo.map((user) => (
                    <div key={user._id} className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {user.profilePic ? (
                            <img src={user.profilePic} alt={user.fullName} className="w-full h-full rounded-full" />
                          ) : (
                            <span className="text-sm font-medium text-primary">
                              {user.fullName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-base-content">{user.fullName}</p>
                        <p className="text-sm text-base-content/70">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div className="bg-base-200 rounded-lg p-4">
                <h4 className="font-medium text-base-content mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Priority
                </h4>
                <div className="flex items-center gap-2">
                  <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                    {task.priority.toUpperCase()}
                  </span>
                  <span className={`text-sm ${getPriorityColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
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
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-base-content">Task Created</p>
                      <p className="text-xs text-base-content/70">{formatDateTime(task.createdAt)}</p>
                    </div>
                  </div>
                  
                  {task.status === 'in-progress' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-base-content">In Progress</p>
                        <p className="text-xs text-base-content/70">Currently being worked on</p>
                      </div>
                    </div>
                  )}
                  
                  {task.status === 'completed' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-base-content">Completed</p>
                        <p className="text-xs text-base-content/70">Task finished successfully</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      isOverdue ? 'bg-error' : 'bg-base-300'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-base-content">Due Date</p>
                      <p className={`text-xs ${
                        isOverdue ? 'text-error' : 'text-base-content/70'
                      }`}>
                        {formatDateTime(task.dueDate)}
                      </p>
                    </div>
                  </div>
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