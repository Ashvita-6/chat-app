import { useState } from "react";
import { 
  Calendar, 
  User, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Clock,
  CheckSquare,
  AlertCircle,
  Tag
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

const TaskCard = ({ 
  task, 
  onUpdate, 
  onDelete, 
  onEdit,
  getPriorityColor, 
  getStatusColor, 
  onClick,
  isReadOnly = false,
  hideEditButton = false,
  hideDeleteButton = false
}) => {
  const { authUser } = useAuthStore();
  const [showActions, setShowActions] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
    }
  };

  // Check if current user can edit this task (only task creator can edit)
  const canEdit = authUser && task.assignedBy && task.assignedBy._id === authUser._id && onEdit;
  
  // Check if current user can delete this task (only task creator can delete)
  const canDelete = authUser && task.assignedBy && task.assignedBy._id === authUser._id && onDelete;

  // Check if current user can update status (assigned users can update status)
  const canUpdateStatus = authUser && onUpdate && (
    (task.assignedBy && task.assignedBy._id === authUser._id) || 
    (task.assignedTo && task.assignedTo.some(user => user._id === authUser._id))
  );

  const daysUntilDue = getDaysUntilDue(task.dueDate);
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

  // Handle missing or undefined task properties safely
  const taskTags = task.tags || [];
  const taskAssignedTo = task.assignedTo || [];

  return (
    <div 
      className="bg-base-100 rounded-lg border border-base-300 p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary/30"
      onClick={() => onClick && onClick()}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-base-content mb-1 truncate">
              {task.title}
            </h3>
            <p className="text-base-content/70 text-sm line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          </div>
          
          {/* Priority Indicator */}
          <div className="flex items-center gap-2 ml-2">
            <span className={`text-xs font-medium uppercase tracking-wide ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            
            {/* Actions Dropdown - Only show if user has permissions */}
            {(canEdit || canDelete) && !hideEditButton && !hideDeleteButton && (
              <div className="dropdown dropdown-end">
                <button
                  tabIndex={0}
                  className="btn btn-ghost btn-sm btn-circle"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActions(!showActions);
                  }}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                <ul className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-40">
                  {canEdit && !hideEditButton && (
                    <li>
                      <button 
                        className="flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit();
                        }}
                      >
                        <Edit className="w-4 h-4" />
                        Edit Task
                      </button>
                    </li>
                  )}
                  {canDelete && !hideDeleteButton && (
                    <li>
                      <button 
                        className="flex items-center gap-2 text-error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete();
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {taskTags.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-base-content/50" />
            <div className="flex flex-wrap gap-1">
              {taskTags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="badge badge-outline badge-sm"
                >
                  {tag}
                </span>
              ))}
              {taskTags.length > 2 && (
                <span className="badge badge-outline badge-sm">
                  +{taskTags.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Due Date */}
        <div className="flex items-center gap-2 text-sm mb-3">
          <Calendar className="w-4 h-4" />
          <span className={`
            ${isOverdue ? 'text-error font-medium' : 
              isDueSoon ? 'text-warning font-medium' : 
              'text-base-content/70'}
          `}>
            {formatDate(task.dueDate)}
            {isOverdue && (
              <span className="ml-1 text-error text-xs">
                (Overdue)
              </span>
            )}
          </span>
        </div>

        {/* Assigned To */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-base-content/70">Assigned:</span>
          <div className="flex items-center gap-1">
            {taskAssignedTo.slice(0, 3).map((user) => (
              <div key={user._id} className="avatar">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.fullName} className="w-full h-full rounded-full" />
                  ) : (
                    <span className="text-xs font-medium text-primary">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {taskAssignedTo.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-base-300 flex items-center justify-center">
                <span className="text-xs font-medium">+{taskAssignedTo.length - 3}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto">
          {/* Status */}
          <div className="flex items-center justify-between mb-3">
            <span className={`badge ${getStatusColor(task.status)} badge-sm`}>
              {task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ') : 'Unknown'}
            </span>
            
            {isOverdue && (
              <div className="flex items-center gap-1 text-error text-xs">
                <AlertCircle className="w-3 h-3" />
                <span>Overdue</span>
              </div>
            )}
          </div>

          {/* Quick Status Updates - Only show if user can update status */}
          {canUpdateStatus && !isReadOnly && (
            <div className="flex gap-1 flex-wrap">
              {task.status !== 'pending' && (
                <button
                  className="btn btn-xs btn-ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange('pending');
                  }}
                  disabled={isUpdating}
                >
                  Mark Pending
                </button>
              )}
              {task.status !== 'in-progress' && (
                <button
                  className="btn btn-xs btn-ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange('in-progress');
                  }}
                  disabled={isUpdating}
                >
                  Start Progress
                </button>
              )}
              {task.status !== 'completed' && (
                <button
                  className="btn btn-xs btn-success"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange('completed');
                  }}
                  disabled={isUpdating}
                >
                  <CheckSquare className="w-3 h-3 mr-1" />
                  Complete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;