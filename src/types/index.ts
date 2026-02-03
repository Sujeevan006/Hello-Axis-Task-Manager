export type Role = 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  department?: string;
  needs_password_change: boolean;
  password?: string; // For updates/creation
  created_at?: string;
  updated_at?: string;
}

export type Priority = 'low' | 'medium' | 'high';

export type TaskStatus = 'todo' | 'in-process' | 'review' | 'completed';

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
  time_allocation: number | null;
  creator_id: string;
  assignee_id: string | null;
  created_at: string;
  creator?: { id: string; name: string; avatar?: string };
  assignee?: { id: string; name: string; avatar?: string };
  activity_logs?: ActivityLog[];
}

export type Organization = {
  name: string;
  description: string;
  logo?: string;
};
