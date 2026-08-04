import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { AttachmentModel, CommentModel, PaginatedResponse, PaginationMeta, Task } from './models';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly api = inject(ApiService);

  getMyTasks(page = 1, limit = 8): Observable<PaginatedResponse<Task>> {
    return this.api.getEnvelope<Task[]>('/tasks/', { page, limit }).pipe(map((response) => this.normalizePaginated(response)));
  }

  getTask(taskId: string): Observable<Task> {
    return this.api.get<Task>(`/tasks/${taskId}`).pipe(map((response) => this.normalizeTask(response)));
  }

  getTasksByProject(projectId: string, page = 1, limit = 8): Observable<PaginatedResponse<Task>> {
    return this.api.getEnvelope<Task[]>(`/projects/${projectId}/tasks`, { page, limit }).pipe(map((response) => this.normalizePaginated(response)));
  }

  createTask(projectId: string, payload: { title: string; description?: string }): Observable<Task> {
    return this.api.post<Task>(`/projects/${projectId}/tasks`, payload);
  }

  updateTask(taskId: string, payload: Record<string, unknown>): Observable<Task> {
    return this.api.patch<Task>(`/tasks/${taskId}`, payload);
  }

  deleteTask(taskId: string): Observable<Task> {
    return this.api.delete<Task>(`/tasks/${taskId}`);
  }

  createComment(taskId: string, payload: { content: string }): Observable<CommentModel> {
    return this.api.post<CommentModel>(`/tasks/${taskId}/comments`, payload);
  }

  uploadAttachment(taskId: string, file: File): Observable<AttachmentModel> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFormData<AttachmentModel>(`/tasks/${taskId}/attachments`, formData);
  }

  deleteAttachment(taskId: string, attachmentId: string): Observable<unknown> {
    return this.api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
  }

  private normalizePaginated(response: unknown): PaginatedResponse<Task> {
    if (response && typeof response === 'object' && 'data' in response) {
      const payload = response as { data?: unknown; meta?: PaginationMeta; summary?: Record<string, unknown> };
      return {
        data: Array.isArray(payload.data) ? (payload.data as Task[]) : [],
        meta: payload.meta || { page: 1, limit: 8, totalItems: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
        summary: payload.summary || {}
      };
    }

    return {
      data: [],
      meta: { page: 1, limit: 8, totalItems: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
      summary: {}
    };
  }

  private normalizeTask(response: unknown): Task {
    if (response && typeof response === 'object' && 'data' in response) {
      const payload = response as { data?: unknown };
      if (payload.data && typeof payload.data === 'object') {
        return payload.data as Task;
      }
    }

    return response as Task;
  }
}
