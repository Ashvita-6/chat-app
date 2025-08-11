import { axiosInstance } from "../lib/axios";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Calendar, User, AlertCircle, CheckSquare } from "lucide-react";
import TaskForm from "../components/tasks/TaskForm";
import TaskCard from "../components/tasks/TaskCard";
import TaskFilters from "../components/tasks/TaskFilters";
import TaskDetailModal from "../components/tasks/TaskDetailModal";
import { useTaskStore } from "../store/useTaskStore";

const TaskAllocationPage = () => {
  const {
    tasks,
    loading,
    chatUsers,
    availableTags,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    fetchChatUsers,
    fetchAvailableTags,
    setSelectedTask
  } = useTaskStore();

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTaskLocal] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    priority: [],
    assignedTo: [],
    tags: [],
    dueDate: "",
    overdue: false
  });

  useEffect(() => {
    // Fetch initial data
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchTasks(filters),
          fetchChatUsers(),
          fetchAvailableTags()
        ]);
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };

    initializeData();
  }, []);

  // Refetch tasks when filters change
  useEffect(() => {
    const searchFilters = { ...filters };
    if (searchTerm.trim()) {
      searchFilters.search = searchTerm.trim();
    }
    fetchTasks(searchFilters);
  }, [filters, searchTerm]);

  const filteredTasks = tasks.filter(task => {
    // Search filter
    const matchesSearch = !searchTerm.trim() || 
                         task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch; // Server-side filtering handles the rest
  });

  // Get all unique tags from tasks
  const taskTags = [...new Set(tasks.flatMap(task => task.tags || []))];

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData);
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (error) {
      // Error is handled in the store
    }
  };

  const handleEditSubmit = async (taskId, taskData) => {
    try {
      await updateTask(taskId, taskData);
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (error) {
      // Error is handled in the store
    }
  };

  const handleTaskFormSubmit = async (taskDataOrId, taskData) => {
    if (editingTask) {
      // If editing, first parameter is taskId, second is taskData
      await handleEditSubmit(taskDataOrId, taskData);
    } else {
      // If creating, first parameter is taskData
      await handleCreateTask(taskDataOrId);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await updateTask(taskId, updates);
    } catch (error) {
      // Error is handled in the store
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      if (selectedTask?._id === taskId) {
        setSelectedTaskLocal(null);
      }
    } catch (error) {
      // Error is handled in the store
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
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
      default: return "badge-ghost";
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-base-content mb-2">Task Allocation</h1>
          <p className="text-base-content/70">Manage and assign tasks to team members</p>
        </div>

        {/* Search and Create */}
        <div className="bg-base-100 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="input input-bordered w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary gap-2"
              onClick={() => {
                setEditingTask(null);
                setShowTaskForm(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Create Task
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <TaskFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          availableUsers={chatUsers}
          availableTags={[...availableTags, ...taskTags]}
        />

        {/* Task Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-base-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tasks.length}</p>
                <p className="text-sm text-base-content/70">Total Tasks</p>
              </div>
            </div>
          </div>
          
          <div className="bg-base-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Calendar className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === "pending").length}</p>
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
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === "in-progress").length}</p>
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
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === "completed").length}</p>
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
              <h3 className="text-lg font-medium text-base-content/70 mb-2">No tasks found</h3>
              <p className="text-base-content/50">
                {tasks.length === 0 ? "Create your first task to get started" : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                  onClick={(clickedTask) => {
                    console.log("TaskCard clicked, task data:", clickedTask || task);
                    setSelectedTaskLocal(clickedTask || task);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          onSubmit={handleTaskFormSubmit}
          onClose={handleCloseTaskForm}
          initialTask={editingTask}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => {
            console.log("Closing task detail modal");
            setSelectedTaskLocal(null);
          }}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          onEdit={handleEditTask}
          getPriorityColor={getPriorityColor}
          getStatusColor={getStatusColor}
        />
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-base-100 p-4 rounded-lg shadow-lg max-w-xs">
          <p className="text-xs">
            Selected Task: {selectedTask ? selectedTask.title || 'No title' : 'None'}
          </p>
          <p className="text-xs">
            Total Tasks: {tasks.length}
          </p>
          <p className="text-xs">
            Filtered Tasks: {filteredTasks.length}
          </p>
        </div>
      )}
    </div>
  );
};

export default TaskAllocationPage;