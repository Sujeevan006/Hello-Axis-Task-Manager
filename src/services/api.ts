import { User, Task, ActivityLog, TaskStatus, Priority, Role } from '../types';
import api from '../api/axios';

// ==================== ADAPTERS ====================

// Convert Backend User (snake_case) to Frontend User (camelCase)
const adaptUser = (data: any): User => ({
  id: data.id,
  name: data.name,
  email: data.email,
  role: data.role as Role,
  avatar: data.avatar,
  department: data.department,
  needsPasswordChange: data.needs_password_change,
  // Backend might send created_at, updated_at
});

// Convert Frontend User (camelCase) to Backend User (snake_case)
const adaptUserPayload = (user: Partial<User>) => ({
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  avatar: user.avatar,
  // password is handled separately in auth or is separate payload
});

// Convert Backend Task (snake_case) to Frontend Task (camelCase)
const adaptTask = (data: any): Task => ({
  id: data.id,
  title: data.title,
  description: data.description,
  status: data.status as TaskStatus,
  priority: data.priority as Priority,
  dueDate: data.due_date,
  timeAllocation: data.time_allocation,
  creatorId: data.creator_id,
  assigneeId: data.assignee_id,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  creator: data.creator ? adaptUser(data.creator) : undefined,
  assignee: data.assignee ? adaptUser(data.assignee) : undefined,
  activityLogs: data.activity_logs
    ? data.activity_logs.map(adaptActivityLog)
    : [],
});

const adaptActivityLog = (data: any): ActivityLog => ({
  id: data.id,
  taskId: data.task_id,
  userId: data.user_id,
  action: data.action,
  timestamp: data.timestamp,
});

// Convert Frontend Task (camelCase) to Backend Task (snake_case)
const adaptTaskPayload = (task: Partial<Task>) => ({
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  due_date: task.dueDate,
  time_allocation: task.timeAllocation,
  assignee_id: task.assigneeId,
  // creator_id is usually set by backend from token
});

// ==================== USER API ====================

export const userAPI = {
  // Get all users
  getAll: async () => {
    const response = await api.get('/users');
    return response.data.map(adaptUser);
  },

  // Get user by ID
  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return adaptUser(response.data);
  },

  // Create user
  create: async (user: Partial<User>) => {
    const response = await api.post('/users', adaptUserPayload(user));
    // Response might include tempPassword
    const newUser = adaptUser(response.data.user || response.data);
    const tempPassword = response.data.tempPassword;

    // We attach tempPassword to the user object (even if not in type strictly)
    // or return a composite object, but the UI expects a User object often.
    // Let's coerce it or rely on the caller handling the response structure if they called it directly.
    // The previous mocked version returned `{ ...newUser, tempPassword }`.
    return { ...newUser, tempPassword };
  },

  // Update user
  update: async (id: string, updates: Partial<User>) => {
    const response = await api.put(`/users/${id}`, adaptUserPayload(updates));
    return adaptUser(response.data);
  },

  // Delete user
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
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
        user: adaptUser(user),
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
  getAll: async (filters?: { status?: string; priority?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);

    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data.map(adaptTask);
  },

  // Get task by ID
  getById: async (id: string) => {
    const response = await api.get(`/tasks/${id}`);
    return adaptTask(response.data);
  },

  // Create task
  create: async (task: Partial<Task>) => {
    const response = await api.post('/tasks', adaptTaskPayload(task));
    return adaptTask(response.data);
  },

  // Update task
  update: async (id: string, updates: Partial<Task>) => {
    const response = await api.put(`/tasks/${id}`, adaptTaskPayload(updates));
    return adaptTask(response.data);
  },

  // Update task status (for drag and drop)
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return adaptTask(response.data);
  },

  // Delete task
  delete: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};
