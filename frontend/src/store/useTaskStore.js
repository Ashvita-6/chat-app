// frontend/src/store/useTaskStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useTaskStore = create((set, get) => ({
  tasks: [],
  selectedTask: null,
  chatUsers: [],
  availableTags: [],
  loading: false,
  error: null,

  // Fetch all tasks with filters
  fetchTasks: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      
      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          if (Array.isArray(value) && value.length > 0) {
            params.append(key, value.join(','));
          } else if (!Array.isArray(value)) {
            params.append(key, value);
          }
        }
      });

      const response = await axiosInstance.get(`/tasks?${params.toString()}`);
      set({ 
        tasks: response.data.data.tasks,
        loading: false 
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      set({ 
        error: error.response?.data?.message || "Failed to fetch tasks",
        loading: false 
      });
      toast.error(error.response?.data?.message || "Failed to fetch tasks");
      throw error;
    }
  },

  // Create new task
  createTask: async (taskData) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post("/tasks", taskData);
      const newTask = response.data.data;
      
      set(state => ({ 
        tasks: [newTask, ...state.tasks],
        loading: false 
      }));
      
      toast.success("Task created successfully");
      return newTask;
    } catch (error) {
      console.error("Error creating task:", error);
      const errorMessage = error.response?.data?.message || "Failed to create task";
      set({ 
        error: errorMessage,
        loading: false 
      });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Update task
  updateTask: async (taskId, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.put(`/tasks/${taskId}`, updates);
      const updatedTask = response.data.data;
      
      set(state => ({
        tasks: state.tasks.map(task => 
          task._id === taskId ? updatedTask : task
        ),
        selectedTask: state.selectedTask?._id === taskId ? updatedTask : state.selectedTask,
        loading: false
      }));
      
      toast.success("Task updated successfully");
      return updatedTask;
    } catch (error) {
      console.error("Error updating task:", error);
      const errorMessage = error.response?.data?.message || "Failed to update task";
      set({ 
        error: errorMessage,
        loading: false 
      });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Delete task
  deleteTask: async (taskId) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/tasks/${taskId}`);
      
      set(state => ({
        tasks: state.tasks.filter(task => task._id !== taskId),
        selectedTask: state.selectedTask?._id === taskId ? null : state.selectedTask,
        loading: false
      }));
      
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete task";
      set({ 
        error: errorMessage,
        loading: false 
      });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Fetch chat users for task assignment
  fetchChatUsers: async () => {
    try {
      const response = await axiosInstance.get("/tasks/chat-users");
      set({ chatUsers: response.data.data });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching chat users:", error);
      toast.error("Failed to load chat contacts");
      throw error;
    }
  },

  // Fetch available tags
  fetchAvailableTags: async () => {
    try {
      const response = await axiosInstance.get("/tasks/tags");
      set({ availableTags: response.data.data });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching tags:", error);
      // Don't show error toast for tags as it's not critical
      return [];
    }
  },

  // Get single task
  fetchTask: async (taskId) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`/tasks/${taskId}`);
      const task = response.data.data;
      set({ 
        selectedTask: task,
        loading: false 
      });
      return task;
    } catch (error) {
      console.error("Error fetching task:", error);
      const errorMessage = error.response?.data?.message || "Failed to fetch task";
      set({ 
        error: errorMessage,
        loading: false 
      });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Assign task to users
  assignTask: async (taskId, userIds) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.put(`/tasks/${taskId}/assign`, { userIds });
      const updatedTask = response.data.data;
      
      set(state => ({
        tasks: state.tasks.map(task => 
          task._id === taskId ? updatedTask : task
        ),
        selectedTask: state.selectedTask?._id === taskId ? updatedTask : state.selectedTask,
        loading: false
      }));
      
      toast.success("Task assigned successfully");
      return updatedTask;
    } catch (error) {
      console.error("Error assigning task:", error);
      const errorMessage = error.response?.data?.message || "Failed to assign task";
      set({ 
        error: errorMessage,
        loading: false 
      });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Get user's tasks
  fetchUserTasks: async (userId, status = 'all') => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`/tasks/user/${userId}?status=${status}`);
      set({ 
        tasks: response.data.data.tasks,
        loading: false 
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching user tasks:", error);
      const errorMessage = error.response?.data?.message || "Failed to fetch user tasks";
      set({ 
        error: errorMessage,
        loading: false 
      });
      toast.error(errorMessage);
      throw error;
    }
  },

  // Set selected task
  setSelectedTask: (task) => set({ selectedTask: task }),

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    tasks: [],
    selectedTask: null,
    chatUsers: [],
    availableTags: [],
    loading: false,
    error: null
  })
}));