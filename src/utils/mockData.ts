import { User, Task, Organization } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'admin',
    avatar:
      'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff',
  },
  {
    id: 'u2',
    name: 'Sarah Smith',
    email: 'sarah@company.com',
    role: 'staff',
    avatar:
      'https://ui-avatars.com/api/?name=Sarah+Smith&background=EB5757&color=fff',
  },
  {
    id: 'u3',
    name: 'John Doe',
    email: 'john@company.com',
    role: 'staff',
    avatar:
      'https://ui-avatars.com/api/?name=John+Doe&background=27AE60&color=fff',
  },
  {
    id: 'u4',
    name: 'Emily Davis',
    email: 'emily@company.com',
    role: 'staff',
    avatar:
      'https://ui-avatars.com/api/?name=Emily+Davis&background=F2994A&color=fff',
  },
];

export const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Design Dashboard Mockups',
    description:
      'Create high-fidelity mockups for the main dashboard view including charts and widgets.',
    assigneeId: 'u2',
    creatorId: 'u1',
    status: 'in-process',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    timeAllocation: 8,
    createdAt: new Date().toISOString(),
    history: [
      {
        id: uuidv4(),
        taskId: 't1',
        userId: 'u1',
        userName: 'Admin User',
        action: 'created the task',
        timestamp: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        taskId: 't1',
        userId: 'u2',
        userName: 'Sarah Smith',
        action: 'moved to In Process',
        timestamp: new Date().toISOString(),
      },
    ],
  },
  {
    id: 't2',
    title: 'Implement Auth Flow',
    description: 'Setup JWT authentication and protected routes.',
    assigneeId: 'u3',
    creatorId: 'u1',
    status: 'todo',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    timeAllocation: 12,
    createdAt: new Date().toISOString(),
    history: [],
  },
  {
    id: 't3',
    title: 'Fix Mobile Responsive Issues',
    description:
      'Padding issues on iPhone SE and navigation overlap on tablets.',
    assigneeId: 'u4',
    creatorId: 'u2',
    status: 'review',
    priority: 'medium',
    dueDate: new Date(Date.now() - 86400000).toISOString(), // overdue
    timeAllocation: 4,
    createdAt: new Date().toISOString(),
    history: [],
  },
  {
    id: 't4',
    title: 'Update Documentation',
    description: 'Update the API documentation with new endpoints.',
    assigneeId: 'u2',
    creatorId: 'u1',
    status: 'completed',
    priority: 'low',
    dueDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    timeAllocation: 2,
    createdAt: new Date().toISOString(),
    history: [],
  },
];

export const mockOrganization: Organization = {
  name: 'Axivers Tech',
  description: 'Leading the future of AI and Web Development.',
  logo: '', // empty for default
};
