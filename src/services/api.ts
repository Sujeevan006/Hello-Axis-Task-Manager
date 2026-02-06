import { User, Task, TaskStatus } from '../types';
import api from '../api/axios';

// ==================== USER API ====================

export const userAPI = {
  // Get all users (Admin only)
  getAll: async (): Promise<User[]> => {
    if (
      import.meta.env.DEV &&
      localStorage.getItem('token') === 'dev-superadmin-token-12345'
    ) {
      return JSON.parse(localStorage.getItem('mock_users') || '[]');
    }
    const response = await api.get('/users');
    return response.data;
  },

  // Create user (Admin only)
  create: async (
    userData: Partial<User> & { password?: string },
  ): Promise<{ user: User; tempPassword?: string }> => {
    // Mock for development mode
    if (
      import.meta.env.DEV &&
      localStorage.getItem('token') === 'dev-superadmin-token-12345'
    ) {
      const newUser: User = {
        id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
        name: userData.name || 'Mock User',
        email: userData.email || 'mock@example.com',
        role: userData.role || 'user',
        avatar: null,
        department: userData.department || null,
        needs_password_change: true,
        created_at: new Date().toISOString(),
      };

      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      localStorage.setItem(
        'mock_users',
        JSON.stringify([...mockUsers, newUser]),
      );

      console.log('⚠️ MOCK STAFF CREATION SUCCESSFUL');
      return { user: newUser, tempPassword: 'GeneratedPass123' };
    }

    const response = await api.post('/users', userData);
    return response.data;
  },

  // Update user role (Admin only)
  updateRole: async (id: string, role: string): Promise<User> => {
    const response = await api.put(`/users/${id}/role`, { role });
    return response.data;
  },

  // Update user profile (Generic update for current user or admin)
  update: async (id: string, updates: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, updates);
    return response.data;
  },

  // Delete user (Admin only)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

// ==================== AUTH API ====================

export const authAPI = {
  // Login
  login: async (email: string, password: string) => {
    // TEMPORARY: Hardcoded superadmin for development testing
    // TODO: Remove when backend registration is properly set up
    if (
      import.meta.env.DEV &&
      email === 'superadmin@axivers.com' &&
      password === 'Axis@123'
    ) {
      console.log('⚠️ USING HARDCODED SUPERADMIN CREDENTIALS FOR DEVELOPMENT');
      const mockUser = {
        token: 'dev-superadmin-token-12345',
        user: {
          id: 'superadmin-dev-id',
          name: 'Super Admin',
          email: 'superadmin@axivers.com',
          role: 'admin' as const,
          avatar: null,
          department: 'Management',
          needs_password_change: false,
          created_at: new Date().toISOString(),
        },
      };

      localStorage.setItem('token', mockUser.token);
      localStorage.setItem('user', JSON.stringify(mockUser.user));

      return {
        success: true,
        user: mockUser.user,
        token: mockUser.token,
      };
    }

    try {
      const response = await api.post('/auth/login', { email, password });
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
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Get current user profile
  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
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
    if (
      import.meta.env.DEV &&
      localStorage.getItem('token') === 'dev-superadmin-token-12345'
    ) {
      return JSON.parse(localStorage.getItem('mock_tasks') || '[]');
    }
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.assignee) params.append('assignee', filters.assignee);

    const response = await api.get('/tasks', { params });
    return response.data;
  },

  // Get task by ID
  getById: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Create task
  create: async (taskData: any): Promise<Task> => {
    if (
      import.meta.env.DEV &&
      localStorage.getItem('token') === 'dev-superadmin-token-12345'
    ) {
      const newTask: Task = {
        id: 'mock-task-' + Math.random().toString(36).substr(2, 9),
        ...taskData,
        created_at: new Date().toISOString(),
        creator: { id: 'superadmin-dev-id', name: 'Super Admin', avatar: null },
      };
      const mockTasks = JSON.parse(localStorage.getItem('mock_tasks') || '[]');
      localStorage.setItem(
        'mock_tasks',
        JSON.stringify([...mockTasks, newTask]),
      );
      console.log('⚠️ MOCK TASK CREATION SUCCESSFUL');
      return newTask;
    }
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  // Update task
  update: async (id: string, updates: any): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, updates);
    return response.data;
  },

  // Update task status
  updateStatus: async (id: string, status: TaskStatus): Promise<Task> => {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  // Delete task (Admin only)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};
