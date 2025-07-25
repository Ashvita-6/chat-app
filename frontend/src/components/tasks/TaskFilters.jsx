import { useState } from "react";
import { 
  Filter, 
  Calendar, 
  User, 
  Tag, 
  AlertTriangle, 
  X,
  ChevronDown 
} from "lucide-react";

const TaskFilters = ({ 
  filters, 
  onFiltersChange, 
  availableUsers = [], 
  availableTags = [] 
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const priorityOptions = [
    { value: "urgent", label: "Urgent", color: "text-error" },
    { value: "high", label: "High", color: "text-warning" },
    { value: "medium", label: "Medium", color: "text-info" },
    { value: "low", label: "Low", color: "text-success" }
  ];

  const statusOptions = [
    { value: "pending", label: "Pending", color: "badge-info" },
    { value: "in-progress", label: "In Progress", color: "badge-warning" },
    { value: "completed", label: "Completed", color: "badge-success" },
    { value: "cancelled", label: "Cancelled", color: "badge-error" }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleArrayFilterChange = (key, value, checked) => {
    const currentArray = filters[key] || [];
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    handleFilterChange(key, newArray);
  };

  const clearFilters = () => {
    onFiltersChange({
      status: "all",
      priority: [],
      assignedTo: [],
      tags: [],
      dueDate: "",
      overdue: false
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status !== "all") count++;
    if (filters.priority?.length > 0) count++;
    if (filters.assignedTo?.length > 0) count++;
    if (filters.tags?.length > 0) count++;
    if (filters.dueDate) count++;
    if (filters.overdue) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-base-100 rounded-lg shadow-sm p-4 mb-6">
      {/* Basic Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Status Filter */}
          <div className="form-control">
            <label className="label label-text font-medium mb-1">Status</label>
            <select
              className="select select-bordered select-sm"
              value={filters.status || "all"}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="all">All Status</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date Filter */}
          <div className="form-control">
            <label className="label label-text font-medium mb-1">Due Date</label>
            <select
              className="select select-bordered select-sm"
              value={filters.dueDate || ""}
              onChange={(e) => handleFilterChange("dueDate", e.target.value)}
            >
              <option value="">All Dates</option>
              <option value="today">Due Today</option>
              <option value="tomorrow">Due Tomorrow</option>
              <option value="this-week">This Week</option>
              <option value="next-week">Next Week</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Overdue Toggle */}
          <div className="form-control">
            <label className="label label-text font-medium mb-1">
              <span>Show Only</span>
            </label>
            <label className="label cursor-pointer justify-start gap-2">
              <input 
                type="checkbox" 
                className="checkbox checkbox-sm checkbox-error" 
                checked={filters.overdue || false}
                onChange={(e) => handleFilterChange("overdue", e.target.checked)}
              />
              <span className="label-text text-error">Overdue Tasks</span>
            </label>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex items-center gap-2">
          <button
            className="btn btn-outline btn-sm gap-2"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="w-4 h-4" />
            Advanced
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
            {activeFilterCount > 0 && (
              <span className="badge badge-primary badge-sm">{activeFilterCount}</span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              className="btn btn-ghost btn-sm gap-2"
              onClick={clearFilters}
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="mt-6 pt-6 border-t border-base-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Priority Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Priority
                </span>
              </label>
              <div className="space-y-2">
                {priorityOptions.map(option => (
                  <label key={option.value} className="label cursor-pointer justify-start gap-2">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-sm" 
                      checked={filters.priority?.includes(option.value) || false}
                      onChange={(e) => handleArrayFilterChange("priority", option.value, e.target.checked)}
                    />
                    <span className={`label-text ${option.color}`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Assigned Users Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Assigned To
                </span>
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableUsers.length === 0 ? (
                  <p className="text-sm text-base-content/50">No users available</p>
                ) : (
                  availableUsers.map(user => (
                    <label key={user._id} className="label cursor-pointer justify-start gap-2">
                      <input 
                        type="checkbox" 
                        className="checkbox checkbox-sm" 
                        checked={filters.assignedTo?.includes(user._id) || false}
                        onChange={(e) => handleArrayFilterChange("assignedTo", user._id, e.target.checked)}
                      />
                      <div className="flex items-center gap-2">
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
                        <span className="label-text">{user.fullName}</span>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Tags Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </span>
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableTags.length === 0 ? (
                  <p className="text-sm text-base-content/50">No tags available</p>
                ) : (
                  availableTags.map(tag => (
                    <label key={tag} className="label cursor-pointer justify-start gap-2">
                      <input 
                        type="checkbox" 
                        className="checkbox checkbox-sm" 
                        checked={filters.tags?.includes(tag) || false}
                        onChange={(e) => handleArrayFilterChange("tags", tag, e.target.checked)}
                      />
                      <span className="label-text">{tag}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="mt-6 pt-4 border-t border-base-300">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-base-content/70">Active Filters:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.status !== "all" && (
                  <span className="badge badge-outline gap-2">
                    Status: {statusOptions.find(s => s.value === filters.status)?.label}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => handleFilterChange("status", "all")}
                    />
                  </span>
                )}
                
                {filters.priority?.map(priority => (
                  <span key={priority} className="badge badge-outline gap-2">
                    Priority: {priorityOptions.find(p => p.value === priority)?.label}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => handleArrayFilterChange("priority", priority, false)}
                    />
                  </span>
                ))}

                {filters.assignedTo?.map(userId => {
                  const user = availableUsers.find(u => u._id === userId);
                  return user ? (
                    <span key={userId} className="badge badge-outline gap-2">
                      Assigned: {user.fullName}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => handleArrayFilterChange("assignedTo", userId, false)}
                      />
                    </span>
                  ) : null;
                })}

                {filters.tags?.map(tag => (
                  <span key={tag} className="badge badge-outline gap-2">
                    Tag: {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => handleArrayFilterChange("tags", tag, false)}
                    />
                  </span>
                ))}

                {filters.dueDate && (
                  <span className="badge badge-outline gap-2">
                    Due: {filters.dueDate.charAt(0).toUpperCase() + filters.dueDate.slice(1).replace('-', ' ')}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => handleFilterChange("dueDate", "")}
                    />
                  </span>
                )}

                {filters.overdue && (
                  <span className="badge badge-error badge-outline gap-2">
                    Overdue Only
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => handleFilterChange("overdue", false)}
                    />
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskFilters;