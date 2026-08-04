export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
  isVerified?: boolean;
  isActive?: boolean;
  isOnline?: boolean;
  lastSeen?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectMember {
  user: User | string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt?: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  owner: User | string;
  members: ProjectMember[];
  status?: string;
  visibility?: string;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  _id: string;
  project: string | Project;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  assignee?: User | string | null;
  creator?: User | string;
  dueDate?: string | null;
  labels?: string[];
  attachments?: Array<AttachmentModel | string>;
  comments?: Array<CommentModel | string>;
  order?: number;
  checklist?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CommentModel {
  _id: string;
  task: string;
  author: User;
  content: string;
  edited?: boolean;
  editedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttachmentModel {
  _id: string;
  uploadedBy: User;
  project: string;
  task: string;
  fileName: string;
  originalName: string;
  publicId: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Invitation {
  _id: string;
  project: Project | { _id: string; name: string };
  sender: string | User;
  receiver: string | User;
  status: 'Pending' | 'Accepted' | 'Rejected' | string;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationItem {
  _id: string;
  receiver: string;
  sender: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityLogItem {
  _id: string;
  project?: string | Project;
  actor?: User | string;
  type: string;
  entityType?: string;
  entityId?: string;
  message: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  summary: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
  summary?: Record<string, unknown>;
  errors?: Record<string, unknown>;
}
