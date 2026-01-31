import { User, Task } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  USERS: 'tm_users',
  TASKS: 'tm_tasks',
  TOKEN: 'tm_token',
};

// Helper to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to get data from local storage
const getStorageString = (key: string) => localStorage.getItem(key);
const setStorageString = (key: string, value: string) =>
  localStorage.setItem(key, value);

const getStoredUsers = (): User[] => {
  const users = getStorageString(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
};

const setStoredUsers = (users: User[]) => {
  setStorageString(STORAGE_KEYS.USERS, JSON.stringify(users));
};

const getStoredTasks = (): Task[] => {
  const tasks = getStorageString(STORAGE_KEYS.TASKS);
  return tasks ? JSON.parse(tasks) : [];
};

const setStoredTasks = (tasks: Task[]) => {
  setStorageString(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

// Initialize default admin if no users exist
const initializeUsers = () => {
  const users = getStoredUsers();
  if (users.length === 0) {
    // Check if we already have a user in auth context storage to not break existing flow totally,
    // otherwise create default admin
    const defaultAdmin: User = {
      id: uuidv4(),
      name: 'Admin User',
      email: 'avsinfo0824@gmail.com',
      role: 'admin',
      avatar: '',
      department: 'Management',
      password: '', // Initially empty as per requirements
      needsPasswordChange: true,
    };
    setStoredUsers([defaultAdmin]);
  }
};

// Initialize immediately
initializeUsers();

// ==================== USER API ====================

export const userAPI = {
  // Get all users
  getAll: async () => {
    await delay(500);
    return getStoredUsers();
  },

  // Get user by ID
  getById: async (id: string) => {
    await delay(300);
    const users = getStoredUsers();
    const user = users.find((u) => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  },

  // Create user
  create: async (userData: Partial<User>) => {
    await delay(500);
    const users = getStoredUsers();
    if (users.find((u) => u.email === userData.email)) {
      throw new Error('User with this email already exists');
    }

    // Generate temporary password for new staff
    const tempPassword = Math.random().toString(36).slice(-8);

    const newUser: User = {
      id: uuidv4(),
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'staff',
      department: userData.department || '',
      avatar: userData.avatar || '',
      password: tempPassword,
      needsPasswordChange: true,
      ...userData,
    } as User;

    users.push(newUser);
    setStoredUsers(users);

    // Return user with temp password for display
    return { ...newUser, tempPassword };
  },

  // Update user
  update: async (id: string, updates: Partial<User>) => {
    await delay(400);
    const users = getStoredUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');

    const updatedUser = { ...users[index], ...updates };
    users[index] = updatedUser;
    setStoredUsers(users);
    return updatedUser;
  },

  // Delete user
  delete: async (id: string) => {
    await delay(400);
    const users = getStoredUsers();
    const filteredUsers = users.filter((u) => u.id !== id);
    if (users.length === filteredUsers.length)
      throw new Error('User not found');

    setStoredUsers(filteredUsers);
    return { success: true, message: 'User deleted' };
  },
};

// ==================== AUTH API ====================

export const authAPI = {
  // Login
  login: async (email: string, password?: string) => {
    await delay(600);
    const users = getStoredUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
      // For first time setup, if no user exists match this email, create it?
      // No, userAPI.create does that.
      // Special case for 'avsinfo0824@gmail.com' if it doesn't exist?
      // It initializes at top.
      return { success: false, error: 'Invalid email or password' };
    }

    // Check password logic
    // 1. If user has no password set (empty string), allow login (first time admin)
    // 2. If user has password, check match

    if (user.password && user.password !== password) {
      return { success: false, error: 'Invalid email or password' };
    }

    // If user has NO password, but password was provided -> fail? or ignore?
    // If user expects password (set) and none provided -> fail
    if (user.password && !password) {
      return { success: false, error: 'Password required' };
    }

    const token = 'mock-jwt-token-' + uuidv4();
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);

    return { success: true, user, token };
  },

  // Change Password
  changePassword: async (password: string, newPassword: string) => {
    await delay(500);
    // In a real app we'd get the current user from session/token
    // Here we have to rely on the context or just hack it slightly
    // expecting the caller knows who it is.
    // Actually, this function signature doesn't pass userId.
    // The previous implementation used the logged in user from the token on backend.

    // We can fetch the currently logged in user from localStorage 'tm_user'
    const currentUserJson = localStorage.getItem('tm_user');
    if (!currentUserJson) throw new Error('Not authenticated');

    const currentUser = JSON.parse(currentUserJson);
    const users = getStoredUsers();
    const index = users.findIndex((u) => u.id === currentUser.id);

    if (index === -1) throw new Error('User not found');
    const user = users[index];

    // Verify old password
    if (user.password && user.password !== password) {
      throw { response: { data: { error: 'Incorrect current password' } } }; // Mocking api error structure
    }

    // Update password
    user.password = newPassword;
    user.needsPasswordChange = false;
    users[index] = user;
    setStoredUsers(users);

    // Update current user in local storage
    localStorage.setItem('tm_user', JSON.stringify(user));

    return { success: true, message: 'Password changed successfully' };
  },
};

// ==================== TASK API ====================

export const taskAPI = {
  // Get all tasks
  getAll: async () => {
    await delay(500);
    return getStoredTasks();
  },

  // Get task by ID
  getById: async (id: string) => {
    await delay(300);
    const tasks = getStoredTasks();
    const task = tasks.find((t) => t.id === id);
    if (!task) throw new Error('Task not found');
    return task;
  },

  // Create task
  create: async (taskData: Partial<Task>) => {
    await delay(400);
    const tasks = getStoredTasks();
    const newTask: Task = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activityLogs: [
        {
          id: uuidv4(),
          action: 'Task created',
          userId: taskData.creatorId || 'unknown',
          timestamp: new Date().toISOString(),
        },
      ],
      description: '',
      ...taskData,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
    } as Task;

    tasks.push(newTask);
    setStoredTasks(tasks);
    return newTask;
  },

  // Update task
  update: async (id: string, updates: Partial<Task>) => {
    await delay(300);
    const tasks = getStoredTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Task not found');

    const updatedTask = {
      ...tasks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Ensure activityLogs array exists before pushing
    if (!updatedTask.activityLogs) updatedTask.activityLogs = [];

    // Add activity log if status changed
    if (updates.status && updates.status !== tasks[index].status) {
      updatedTask.activityLogs.push({
        id: uuidv4(),
        action: `Status updated to ${updates.status}`,
        userId: 'unknown', // Ideally passed in updates or context
        timestamp: new Date().toISOString(),
      });
    }

    tasks[index] = updatedTask;
    setStoredTasks(tasks);
    return updatedTask;
  },

  // Update task status
  updateStatus: async (id: string, status: string) => {
    return taskAPI.update(id, { status } as any);
  },

  // Delete task
  delete: async (id: string) => {
    await delay(300);
    const tasks = getStoredTasks();
    const filteredTasks = tasks.filter((t) => t.id !== id);
    setStoredTasks(filteredTasks);
    return { success: true, message: 'Task deleted' };
  },
};
