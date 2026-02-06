import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Task, User, Organization, TaskStatus } from '../types';
import { mockOrganization } from '../utils/mockData';
import { useAuth } from './AuthContext';
import { taskAPI, userAPI } from '../services/api';

interface TaskContextType {
  tasks: Task[];
  users: User[];
  organization: Organization;
  addTask: (
    task: Omit<
      Task,
      'id' | 'created_at' | 'activity_logs' | 'creator' | 'assignee'
    > & { assignee_id?: string },
  ) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  addStaff: (
    staff: Omit<
      User,
      'id' | 'created_at' | 'avatar' | 'department' | 'needs_password_change'
    > & { password?: string; role?: string },
  ) => Promise<string>;
  updateStaff: (id: string, updates: Partial<User>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  updateOrganization: (updates: Partial<Organization>) => void;
  refreshTasks: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  isLoading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { user: currentUser } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    const init = async () => {
      if (currentUser) {
        setIsLoading(true);
        // Only fetch if we have a user
        await Promise.all([refreshTasks(), refreshUsers()]);
        setIsLoading(false);
      } else {
        // If no user, ensure state is clean
        setTasks([]);
        setUsers([]);
        setIsLoading(false);
      }
    };
    init();
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('tm_org', JSON.stringify(organization));
  }, [organization]);

  const addTask = async (
    taskData: Omit<
      Task,
      'id' | 'created_at' | 'activity_logs' | 'creator' | 'assignee'
    > & { assignee_id?: string },
  ) => {
    try {
      await taskAPI.create(taskData);
      await refreshTasks(); // Re-fetch to get real UUIDs and linked objects
    } catch (error) {
      console.error('Failed to add task:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: any) => {
    try {
      await taskAPI.update(id, updates);
      await refreshTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    try {
      await taskAPI.updateStatus(taskId, newStatus);
      await refreshTasks();
    } catch (error) {
      console.error('Failed to move task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskAPI.delete(id);
      await refreshTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

  const addStaff = async (
    staffData: Omit<
      User,
      'id' | 'created_at' | 'avatar' | 'department' | 'needs_password_change'
    > & { password?: string; role?: string },
  ) => {
    try {
      const response = await userAPI.create(staffData);
      await refreshUsers();
      return response.tempPassword || '';
    } catch (error) {
      console.error('Failed to add staff:', error);
      throw error;
    }
  };

  const updateStaff = async (id: string, updates: Partial<User>) => {
    try {
      await userAPI.update(id, updates);
      await refreshUsers();
    } catch (error) {
      console.error('Failed to update staff:', error);
      throw error;
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      await userAPI.delete(id);
      await refreshUsers();
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
        isLoading,
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
