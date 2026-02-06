export type Role = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string | null;
  department: string | null;
  needs_password_change: boolean;
  created_at: string;
  updated_at?: string;
}

export type Priority = 'low' | 'medium' | 'high';

export type TaskStatus = 'todo' | 'in_process' | 'completed';

export interface ActivityLog {
  id: string;
  task_id: string;
  user_id: string;
  action: string;
  timestamp: string;
  user?: { name: string };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  due_date: string | null;
  time_allocation: string | null;
  creator: { id: string; name: string; avatar: string | null };
  assignee: { id: string; name: string; avatar: string | null } | null;
  created_at: string;
  updated_at?: string;
  activity_logs?: ActivityLog[];
}

export type Organization = {
  name: string;
  description: string;
  logo?: string;
};
