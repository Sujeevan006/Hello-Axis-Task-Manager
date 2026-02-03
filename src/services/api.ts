import { User, Task, TaskStatus } from '../types';
import api from '../api/axios';

// ==================== USER API ====================

export const userAPI = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  // Get user by ID
  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create user
  create: async (
    userData: Partial<User>,
  ): Promise<{ user: User; tempPassword?: string }> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Update user
  update: async (id: string, updates: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, updates);
    return response.data;
  },

  // Delete user
  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

// ==================== AUTH API ====================

export const authAPI = {
  // Login
  login: async (email: string, password?: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      if (token) {
        localStorage.setItem('token', token);
      }

      return {
        success: true,
        user,
        token,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  },

  // Change Password
  changePassword: async (password: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', {
      password,
      newPassword,
    });
    return response.data;
  },
};

// ==================== TASK API ====================

export const taskAPI = {
  // Get all tasks
  getAll: async (filters?: {
    status?: string;
    priority?: string;
    assignee?: string;
  }): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.assignee) params.append('assignee', filters.assignee);

    const response = await api.get('/tasks', { params });
    return response.data;
  },

  // Get task by ID
  getById: async (id: string): Promise<Task> => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error: any) {
      // Fallback as per user request: If 404, fetch all and find client-side
      if (error.response?.status === 404) {
        const tasks = await taskAPI.getAll();
        const task = tasks.find((t) => t.id === id);
        if (task) return task;
      }
      throw error;
    }
  },

  // Create task
  create: async (taskData: Partial<Task>): Promise<Task> => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  // Update task
  update: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, updates);
    return response.data;
  },

  // Update task status (for drag and drop)
  updateStatus: async (id: string, status: TaskStatus): Promise<Task> => {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  // Delete task
  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};
