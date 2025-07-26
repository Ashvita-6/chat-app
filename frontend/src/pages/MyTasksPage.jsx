import { useState, useEffect } from "react";
import { Search, Calendar, User, AlertCircle, CheckSquare, Filter } from "lucide-react";
import TaskCard from "../components/tasks/TaskCard";
import TaskDetailModal from "../components/tasks/TaskDetailModal";
import { useTaskStore } from "../store/useTaskStore";
import { useAuthStore } from "../store/useAuthStore";

const MyTasksPage = () => {
  const { authUser } = useAuthStore();
  const {
    tasks,
    loading,
    fetchUserTasks,
    updateTask,
    setSelectedTask
  } = useTaskStore();

  const [selectedTask, setSelectedTaskLocal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (authUser?._id) {
      fetchUserTasks(authUser._id, statusFilter);
    }
  }, [authUser, statusFilter, fetchUserTasks]);

  const filteredTasks = tasks.filter(task => {
    // Search filter
    const matchesSearch = !searchTerm.trim() || 
                         task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Only show tasks where the current user is assigned (not created by them)
    const isAssignedToMe = task.assignedTo.some(user => user._id === authUser._id);
    
    return matchesSearch && isAssignedToMe;
  });

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await updateTask(taskId, updates);
      // Update the selected task if it's currently open
      if (selectedTask?._id === taskId) {
        const updatedTask = tasks.find(t => t._id === taskId);
        if (updatedTask) {
          setSelectedTaskLocal({ ...updatedTask, ...updates });
        }
      }
    } catch (error) {
      // Error is handled in the store
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent": return "text-error";
      case "high": return "text-warning";
      case "medium": return "text-info";
      case "low": return "text-success";
      default: return "text-base-content";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "badge-success";
      case "in-progress": return "badge-warning";
      case "pending": return "badge-info";
      case "cancelled": return "badge-error";
      default: return "badge-ghost";
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-base-content mb-2">My Tasks</h1>
          <p className="text-base-content/70">Tasks assigned to you</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-base-100 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-4 h-4" />
              <input
                type="text"
                placeholder="Search my tasks..."
                className="input input-bordered w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <select
                className="select select-bordered"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-base-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredTasks.length}</p>
                <p className="text-sm text-base-content/70">My Tasks</p>
              </div>
            </div>
          </div>
          
          <div className="bg-base-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Calendar className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {filteredTasks.filter(t => t.status === "pending").length}
                </p>
                <p className="text-sm text-base-content/70">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-base-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <User className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {filteredTasks.filter(t => t.status === "in-progress").length}
                </p>
                <p className="text-sm text-base-content/70">In Progress</p>
              </div>
            </div>
          </div>

          <div className="bg-base-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckSquare className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {filteredTasks.filter(t => t.status === "completed").length}
                </p>
                <p className="text-sm text-base-content/70">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="bg-base-100 rounded-lg shadow-sm p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-base-content/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-base-content/70 mb-2">No tasks assigned</h3>
              <p className="text-base-content/50">
                {tasks.length === 0 
                  ? "You haven't been assigned any tasks yet" 
                  : "No tasks match your current filters"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onUpdate={handleUpdateTask}
                  onDelete={() => {}} // Assigned users can't delete tasks
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                  onClick={() => setSelectedTaskLocal(task)}
                  isReadOnly={false} // Assigned users can update status
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTaskLocal(null)}
          onUpdate={handleUpdateTask}
          onDelete={() => {}} // Assigned users can't delete
          getPriorityColor={getPriorityColor}
          getStatusColor={getStatusColor}
          isReadOnly={false} // Allow status updates
          hideEditButton={true} // Hide edit button for assigned users
          hideDeleteButton={true} // Hide delete button for assigned users
        />
      )}
    </div>
  );
};

export default MyTasksPage;