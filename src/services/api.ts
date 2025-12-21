import { User, Task } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || 'An error occurred');
  }

  return response.json();
}

// ==================== USER API ====================

export const userAPI = {
  // Get all users
  getAll: () => apiCall<User[]>('/users'),

  // Get user by ID
  getById: (id: string) => apiCall<User>(`/users/${id}`),

  // Create user
  create: (user: Partial<User>) =>
    apiCall<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    }),

  // Update user
  update: (id: string, updates: Partial<User>) =>
    apiCall<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Delete user
  delete: (id: string) =>
    apiCall<{ success: boolean; message: string }>(`/users/${id}`, {
      method: 'DELETE',
    }),
};

// ==================== AUTH API ====================

export const authAPI = {
  // Login
  login: (email: string, password?: string) =>
    apiCall<{ success: boolean; user?: User; error?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// ==================== TASK API ====================

export const taskAPI = {
  // Get all tasks
  getAll: () => apiCall<Task[]>('/tasks'),

  // Get task by ID
  getById: (id: string) => apiCall<Task>(`/tasks/${id}`),

  // Create task
  create: (task: Partial<Task>) =>
    apiCall<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    }),

  // Update task
  update: (id: string, updates: Partial<Task>) =>
    apiCall<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Delete task
  delete: (id: string) =>
    apiCall<{ success: boolean; message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
};
