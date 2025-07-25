import { useState, useEffect } from "react";
import { X, User, Calendar, AlertTriangle, Tag, Plus, Minus } from "lucide-react";

const TaskForm = ({ onSubmit, onClose, initialTask = null }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: [],
    priority: "medium",
    dueDate: "",
    tags: []
  });

  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Mock users - replace with actual user data
  const mockUsers = [
    { _id: "user1", fullName: "John Doe", email: "john@example.com", profilePic: "" },
    { _id: "user2", fullName: "Jane Smith", email: "jane@example.com", profilePic: "" },
    { _id: "user3", fullName: "Bob Wilson", email: "bob@example.com", profilePic: "" },
    { _id: "user4", fullName: "Alice Johnson", email: "alice@example.com", profilePic: "" },
    { _id: "user5", fullName: "Charlie Brown", email: "charlie@example.com", profilePic: "" }
  ];

  const [availableUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (initialTask) {
      setFormData({
        title: initialTask.title,
        description: initialTask.description,
        assignedTo: initialTask.assignedTo.map(user => user._id),
        priority: initialTask.priority,
        dueDate: initialTask.dueDate?.split('T')[0] || "",
        tags: initialTask.tags || []
      });
    }
  }, [initialTask]);

  const filteredUsers = availableUsers.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.assignedTo.length === 0) {
      newErrors.assignedTo = "At least one person must be assigned";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dueDate = "Due date cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const taskData = {
        ...formData,
        assignedBy: { _id: "current-user", fullName: "Current User" }, // Replace with actual current user
        assignedTo: formData.assignedTo.map(userId => 
          availableUsers.find(user => user._id === userId)
        )
      };

      await onSubmit(taskData);
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUser = (userId) => {
    if (!formData.assignedTo.includes(userId)) {
      setFormData(prev => ({
        ...prev,
        assignedTo: [...prev.assignedTo, userId]
      }));
    }
    setSearchTerm("");
  };

  const handleRemoveUser = (userId) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.filter(id => id !== userId)
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const assignedUsers = formData.assignedTo.map(userId =>
    availableUsers.find(user => user._id === userId)
  ).filter(Boolean);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <h2 className="text-xl font-bold text-base-content">
            {initialTask ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Task Title *</span>
            </label>
            <input
              type="text"
              className={`input input-bordered ${errors.title ? 'input-error' : ''}`}
              placeholder="Enter task title..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
            {errors.title && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.title}</span>
              </label>
            )}
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Description *</span>
            </label>
            <textarea
              className={`textarea textarea-bordered h-24 ${errors.description ? 'textarea-error' : ''}`}
              placeholder="Describe the task in detail..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
            {errors.description && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.description}</span>
              </label>
            )}
          </div>

          {/* Priority */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Priority</span>
            </label>
            <select
              className="select select-bordered"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Due Date */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Due Date *</span>
            </label>
            <input
              type="date"
              className={`input input-bordered ${errors.dueDate ? 'input-error' : ''}`}
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            />
            {errors.dueDate && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.dueDate}</span>
              </label>
            )}
          </div>

          {/* Assign To */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Assign To *</span>
            </label>
            
            {/* Search Users */}
            <div className="relative mb-3">
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Search users to assign..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              {/* User Dropdown */}
              {searchTerm && (
                <div className="absolute top-full left-0 right-0 bg-base-100 border border-base-300 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <div className="p-3 text-base-content/50 text-center">No users found</div>
                  ) : (
                    filteredUsers.map(user => (
                      <button
                        key={user._id}
                        type="button"
                        className="w-full p-3 text-left hover:bg-base-200 flex items-center gap-3"
                        onClick={() => handleAssignUser(user._id)}
                        disabled={formData.assignedTo.includes(user._id)}
                      >
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
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-base-content/70">{user.email}</div>
                        </div>
                        {formData.assignedTo.includes(user._id) && (
                          <span className="ml-auto text-success text-sm">✓ Assigned</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Assigned Users */}
            {assignedUsers.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm text-base-content/70">Assigned users:</span>
                <div className="flex flex-wrap gap-2">
                  {assignedUsers.map(user => (
                    <div key={user._id} className="flex items-center gap-2 bg-base-200 rounded-full px-3 py-1">
                      <div className="avatar">
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
                      <span className="text-sm">{user.fullName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveUser(user._id)}
                        className="btn btn-ghost btn-xs btn-circle"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errors.assignedTo && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.assignedTo}</span>
              </label>
            )}
          </div>

          {/* Tags */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Tags</span>
            </label>
            
            {/* Add Tag */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                className="input input-bordered flex-1"
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn btn-outline"
                disabled={!newTag.trim()}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Current Tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="badge badge-outline gap-2">
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="btn btn-ghost btn-xs btn-circle"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-base-300">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  {initialTask ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  {initialTask ? "Update Task" : "Create Task"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;