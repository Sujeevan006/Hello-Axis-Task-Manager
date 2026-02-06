import { User, Task, TaskStatus } from '../types';
import api from '../api/axios';

// ==================== USER API ====================

export const userAPI = {
  // Get all users (Admin only)
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/api/users');
    return response.data;
  },

  // Create user (Admin only)
  create: async (
    userData: Partial<User> & { password?: string },
  ): Promise<{ user: User; tempPassword?: string }> => {
    const response = await api.post('/api/users', userData);
    return response.data;
  },

  // Update user role (Admin only)
  updateRole: async (id: string, role: string): Promise<User> => {
    const response = await api.put(`/api/users/${id}/role`, { role });
    return response.data;
  },

  // Update user profile (Generic update for current user or admin)
  update: async (id: string, updates: Partial<User>): Promise<User> => {
    const response = await api.put(`/api/users/${id}`, updates);
    return response.data;
  },

  // Delete user (Admin only)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/users/${id}`);
  },
};

// ==================== AUTH API ====================

export const authAPI = {
  // Login
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }

      return {
        success: true,
        user,
        token,
      };
    } catch (error: any) {
      console.error('Login failed with error response:', error.response?.data);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Login failed',
      };
    }
  },

  // Register
  register: async (userData: any) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  // Get current user profile
  getMe: async (): Promise<User> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  // Change Password
  changePassword: async (password: string, newPassword: string) => {
    const response = await api.post('/api/auth/change-password', {
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

    const response = await api.get('/api/tasks', { params });
    return response.data;
  },

  // Get task by ID
  getById: async (id: string): Promise<Task> => {
    const response = await api.get(`/api/tasks/${id}`);
    return response.data;
  },

  // Create task
  create: async (taskData: any): Promise<Task> => {
    const response = await api.post('/api/tasks', taskData);
    return response.data;
  },

  // Update task
  update: async (id: string, updates: any): Promise<Task> => {
    const response = await api.put(`/api/tasks/${id}`, updates);
    return response.data;
  },

  // Update task status
  updateStatus: async (id: string, status: TaskStatus): Promise<Task> => {
    const response = await api.patch(`/api/tasks/${id}/status`, { status });
    return response.data;
  },

  // Delete task (Admin only)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/tasks/${id}`);
  },
};
