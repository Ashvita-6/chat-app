import { useState, useEffect } from "react";
import { Plus, Search, Filter, Calendar, User, AlertCircle, CheckSquare } from "lucide-react";
import TaskForm from "../components/tasks/TaskForm";
import TaskCard from "../components/tasks/TaskCard";
import TaskFilters from "../components/tasks/TaskFilters";
import TaskDetailModal from "../components/tasks/TaskDetailModal";

const TaskAllocationPage = () => {
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    priority: [],
    assignedTo: [],
    tags: [],
    dueDate: "",
    overdue: false
  });
  const [loading, setLoading] = useState(false);

  // Mock users data
  const mockUsers = [
    { _id: "user1", fullName: "John Doe", email: "john@example.com", profilePic: "" },
    { _id: "user2", fullName: "Jane Smith", email: "jane@example.com", profilePic: "" },
    { _id: "user3", fullName: "Bob Wilson", email: "bob@example.com", profilePic: "" },
    { _id: "user4", fullName: "Alice Johnson", email: "alice@example.com", profilePic: "" },
    { _id: "user5", fullName: "Charlie Brown", email: "charlie@example.com", profilePic: "" }
  ];

  // Mock data for demonstration - replace with actual API calls
  const mockTasks = [
    {
      _id: "1",
      title: "Design new chat interface",
      description: "Create mockups for the new chat interface with improved UX",
      assignedBy: { _id: "user1", fullName: "John Doe", profilePic: "" },
      assignedTo: [
        { _id: "user2", fullName: "Jane Smith", profilePic: "" },
        { _id: "user3", fullName: "Bob Wilson", profilePic: "" }
      ],
      priority: "high",
      status: "in-progress",
      dueDate: "2025-07-30",
      tags: ["design", "ui/ux"],
      createdAt: "2025-07-24T10:00:00Z"
    },
    {
      _id: "2",
      title: "Fix authentication bug",
      description: "Users are unable to login with special characters in password",
      assignedBy: { _id: "user1", fullName: "John Doe", profilePic: "" },
      assignedTo: [
        { _id: "user4", fullName: "Alice Johnson", profilePic: "" }
      ],
      priority: "urgent",
      status: "pending",
      dueDate: "2025-07-25",
      tags: ["bug", "authentication"],
      createdAt: "2025-07-24T09:00:00Z"
    },
    {
      _id: "3",
      title: "Update documentation",
      description: "Update API documentation with new endpoints",
      assignedBy: { _id: "user2", fullName: "Jane Smith", profilePic: "" },
      assignedTo: [
        { _id: "user1", fullName: "John Doe", profilePic: "" }
      ],
      priority: "medium",
      status: "completed",
      dueDate: "2025-07-28",
      tags: ["documentation"],
      createdAt: "2025-07-23T14:00:00Z"
    }
  ];

  useEffect(() => {
    // Simulate loading tasks
    setLoading(true);
    setTimeout(() => {
      setTasks(mockTasks);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredTasks = tasks.filter(task => {
    // Search filter
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = filters.status === "all" || task.status === filters.status;
    
    // Priority filter
    const matchesPriority = filters.priority.length === 0 || filters.priority.includes(task.priority);
    
    // Assigned to filter
    const matchesAssignedTo = filters.assignedTo.length === 0 || 
                             task.assignedTo.some(user => filters.assignedTo.includes(user._id));
    
    // Tags filter
    const matchesTags = filters.tags.length === 0 || 
                       filters.tags.some(tag => task.tags.includes(tag));
    
    // Due date filter
    let matchesDueDate = true;
    if (filters.dueDate) {
      const today = new Date();
      const taskDue = new Date(task.dueDate);
      const diffDays = Math.ceil((taskDue - today) / (1000 * 60 * 60 * 24));
      
      switch (filters.dueDate) {
        case "today":
          matchesDueDate = diffDays === 0;
          break;
        case "tomorrow":
          matchesDueDate = diffDays === 1;
          break;
        case "this-week":
          matchesDueDate = diffDays >= 0 && diffDays <= 7;
          break;
        case "next-week":
          matchesDueDate = diffDays > 7 && diffDays <= 14;
          break;
        case "overdue":
          matchesDueDate = diffDays < 0;
          break;
        default:
          matchesDueDate = true;
      }
    }
    
    // Overdue filter
    const matchesOverdue = !filters.overdue || 
                          (new Date(task.dueDate) < new Date() && task.status !== 'completed');
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignedTo && 
           matchesTags && matchesDueDate && matchesOverdue;
  });

  // Get all unique tags from tasks
  const availableTags = [...new Set(tasks.flatMap(task => task.tags || []))];

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleCreateTask = (taskData) => {
    const newTask = {
      _id: Date.now().toString(),
      ...taskData,
      createdAt: new Date().toISOString(),
      status: "pending"
    };
    setTasks(prev => [newTask, ...prev]);
    setShowTaskForm(false);
  };

  const handleUpdateTask = (taskId, updates) => {
    setTasks(prev => prev.map(task => 
      task._id === taskId ? { ...task, ...updates } : task
    ));
  };

  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task._id !== taskId));
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
              onClick={() => setShowTaskForm(true)}
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
          availableUsers={mockUsers}
          availableTags={availableTags}
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
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onClose={() => setShowTaskForm(false)}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          getPriorityColor={getPriorityColor}
          getStatusColor={getStatusColor}
        />
      )}
    </div>
  );
};

export default TaskAllocationPage;