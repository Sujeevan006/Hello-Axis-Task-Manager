export type Role = 'admin' | 'staff';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  department?: string;
  password?: string;
  needsPasswordChange?: boolean;
};

export type Priority = 'low' | 'medium' | 'high';

export type TaskStatus = 'todo' | 'in-process' | 'review' | 'completed';

export type ActivityLog = {
  id: string;
  taskId?: string; // Made optional or ensure it's always there
  userId: string;
  action: string;
  timestamp: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  timeAllocation?: number;
  creatorId: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt?: string;
  creator?: User;
  assignee?: User;
  activityLogs?: ActivityLog[];
};

export type Organization = {
  name: string;
  description: string;
  logo?: string;
};
