export type AppLanguage = 'En' | 'Fa';
export type AppTheme = 'Light' | 'Dark';

export interface SimulatedUser {
  uid: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'owner' | 'admin' | 'member';
  workspaceId: string | null;
}

export interface SimulatedWorkspace {
  id: string;
  name: string;
  inviteCode: string;
  memberNames: string[];
}

export interface TaskAttachment {
  name: string;
  url: string;
}

export interface TaskComment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
}

export interface SimulatedTask {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  creator: string; // Name or email of creator
  assignedUser: string; // Name or email of assignee
  creationDate: number; // Timestamp
  createdAt?: number; // Support legacy fallback
  dueDate: string; // YYYY-MM-DD
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'Pending' | 'In Progress' | 'Completed';
  isCompleted: boolean; // synced with status === 'Completed'
  attachments: TaskAttachment[];
  comments: TaskComment[];
  isArchived: boolean; // For archiving Completed tasks
}

export interface SimulatedMessage {
  id: string;
  workspaceId: string;
  senderName: string;
  senderRole: string;
  avatarUrl: string;
  text: string;
  timestamp: number;
  isAi?: boolean;
}
