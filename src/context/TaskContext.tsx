import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Task, User, Organization, ActivityLog, TaskStatus } from '../types';
import { mockTasks, mockUsers, mockOrganization } from '../utils/mockData';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';

interface TaskContextType {
  tasks: Task[];
  users: User[];
  organization: Organization;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'history'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  addStaff: (staff: Omit<User, 'id'>) => void;
  updateStaff: (id: string, updates: Partial<User>) => void;
  deleteStaff: (id: string) => void;
  updateOrganization: (updates: Partial<Organization>) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { user: currentUser } = useAuth();

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tm_tasks');
    return saved ? JSON.parse(saved) : mockTasks;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('tm_users');
    return saved ? JSON.parse(saved) : mockUsers;
  });

  const [organization, setOrganization] = useState<Organization>(() => {
    const saved = localStorage.getItem('tm_org');
    return saved ? JSON.parse(saved) : mockOrganization;
  });

  useEffect(() => {
    localStorage.setItem('tm_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('tm_users', JSON.stringify(users));
  }, [users]);

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
          return { ...t, history: [newLog, ...t.history] };
        }
        return t;
      })
    );
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'history'>) => {
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      history: [],
    };
    // Initial log
    const creationLog: ActivityLog = {
      id: uuidv4(),
      taskId: newTask.id,
      userId: currentUser?.id || 'system',
      userName: currentUser?.name || 'System',
      action: 'created the task',
      timestamp: new Date().toISOString(),
    };
    newTask.history = [creationLog];

    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          // Check what changed for logs (simplified)
          // Ideally we compare each field
          return { ...t, ...updates };
        }
        return t;
      })
    );
    // Note: Detailed logging for updates can be added here if needed
    if (updates.status) {
      // managed by moveTask mostly, but handled here too
    }
  };

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    updateTask(taskId, { status: newStatus });
    addLog(taskId, `moved task to ${newStatus.replace('-', ' ')}`);
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const addStaff = (staffData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...staffData,
      id: uuidv4(),
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const updateStaff = (id: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
  };

  const deleteStaff = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
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
