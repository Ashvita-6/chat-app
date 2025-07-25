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

const TaskCard = ({ task, onUpdate, onDelete, getPriorityColor, getStatusColor, onClick }) => {
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
    }
  };

  const daysUntilDue = getDaysUntilDue(task.dueDate);
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

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
            
            {/* Actions Dropdown */}
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
                <li>
                  <button 
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit className="w-4 h-4" />
                    Edit Task
                  </button>
                </li>
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
              </ul>
            </div>
          </div>
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-base-content/50" />
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="badge badge-outline badge-sm"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 2 && (
                <span className="badge badge-outline badge-sm">
                  +{task.tags.length - 2}
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
            {task.assignedTo.slice(0, 3).map((user) => (
              <div key={user._id} className="avatar">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.fullName} className="w-full h-full rounded-full" />
                  ) : (
                    <span className="text-xs font-medium text-primary">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {task.assignedTo.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-base-300 flex items-center justify-center">
                <span className="text-xs font-medium">+{task.assignedTo.length - 3}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between">
          <span className={`badge ${getStatusColor(task.status)} badge-sm`}>
            {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
          </span>
          
          {isOverdue && (
            <div className="flex items-center gap-1 text-error text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>Overdue</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;