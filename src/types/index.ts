export type Role = 'admin' | 'staff';

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
};

export type Priority = 'low' | 'medium' | 'high';

export type TaskStatus = 'todo' | 'in-process' | 'review' | 'completed';

export type ActivityLog = {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  assigneeId?: string;
  creatorId: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  timeAllocation?: number;
  createdAt: string;
  history: ActivityLog[];
};
    
export type Organization = {
  name: string;
  description: string;
  logo?: string;
};
