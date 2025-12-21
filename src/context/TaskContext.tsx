import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Task, User, Organization, ActivityLog, TaskStatus } from '../types';
import { mockOrganization } from '../utils/mockData';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { taskAPI, userAPI } from '../services/api';

interface TaskContextType {
  tasks: Task[];
  users: User[];
  organization: Organization;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'history'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  addStaff: (staff: Omit<User, 'id'>) => Promise<void>;
  updateStaff: (id: string, updates: Partial<User>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  updateOrganization: (updates: Partial<Organization>) => void;
  refreshTasks: () => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { user: currentUser } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [organization, setOrganization] = useState<Organization>(() => {
    const saved = localStorage.getItem('tm_org');
    return saved ? JSON.parse(saved) : mockOrganization;
  });

  // Load tasks from API
  const refreshTasks = async () => {
    try {
      const fetchedTasks = await taskAPI.getAll();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  // Load users from API
  const refreshUsers = async () => {
    try {
      const fetchedUsers = await userAPI.getAll();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  // Initial load
  useEffect(() => {
    refreshTasks();
    refreshUsers();
  }, []);

  useEffect(() => {
    localStorage.setItem('tm_org', JSON.stringify(organization));
  }, [organization]);

  const addLog = (taskId: string, action: string) => {
    if (!currentUser) return;
    const newLog: ActivityLog = {
      id: uuidv4(),
      taskId,
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      timestamp: new Date().toISOString(),
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return { ...t, history: [newLog, ...(t.history || [])] };
        }
        return t;
      })
    );
  };

  const addTask = async (
    taskData: Omit<Task, 'id' | 'createdAt' | 'history'>
  ) => {
    try {
      const newTask: Partial<Task> = {
        ...taskData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.id || 'system',
      };

      const createdTask = await taskAPI.create(newTask);

      // Add initial log
      const creationLog: ActivityLog = {
        id: uuidv4(),
        taskId: createdTask.id,
        userId: currentUser?.id || 'system',
        userName: currentUser?.name || 'System',
        action: 'created the task',
        timestamp: new Date().toISOString(),
      };

      setTasks((prev) => [{ ...createdTask, history: [creationLog] }, ...prev]);
    } catch (error) {
      console.error('Failed to add task:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await taskAPI.update(id, updates);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updatedTask } : t))
      );
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    try {
      await updateTask(taskId, { status: newStatus });
      addLog(taskId, `moved task to ${newStatus.replace('-', ' ')}`);
    } catch (error) {
      console.error('Failed to move task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskAPI.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

  const addStaff = async (staffData: Omit<User, 'id'>) => {
    try {
      const newUser: Partial<User> = {
        ...staffData,
        id: uuidv4(),
      };
      const createdUser = await userAPI.create(newUser);
      setUsers((prev) => [...prev, createdUser]);
    } catch (error) {
      console.error('Failed to add staff:', error);
      throw error;
    }
  };

  const updateStaff = async (id: string, updates: Partial<User>) => {
    try {
      const updatedUser = await userAPI.update(id, updates);
      setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
    } catch (error) {
      console.error('Failed to update staff:', error);
      throw error;
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      await userAPI.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error('Failed to delete staff:', error);
      throw error;
    }
  };

  const updateOrganization = (updates: Partial<Organization>) => {
    setOrganization((prev) => ({ ...prev, ...updates }));
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        users,
        organization,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        addStaff,
        updateStaff,
        deleteStaff,
        updateOrganization,
        refreshTasks,
        refreshUsers,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
