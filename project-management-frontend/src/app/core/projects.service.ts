import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { ActivityLogItem, PaginatedResponse, PaginationMeta, Project, ProjectMember } from './models';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly api = inject(ApiService);

  getProjects(): Observable<Project[]> {
    return this.api.get<Project[]>('/projects/');
  }

  getProject(projectId: string): Observable<Project> {
    return this.api.get<Project>(`/projects/${projectId}`);
  }

  createProject(payload: { name: string; description?: string }): Observable<Project> {
    return this.api.post<Project>('/projects/', payload);
  }

  updateProject(projectId: string, payload: Record<string, unknown>): Observable<Project> {
    return this.api.patch<Project>(`/projects/${projectId}`, payload);
  }

  deleteProject(projectId: string): Observable<Project> {
    return this.api.delete<Project>(`/projects/${projectId}`);
  }

  getMembers(projectId: string): Observable<ProjectMember[]> {
    return this.api.get<ProjectMember[]>(`/projects/${projectId}/members/`);
  }

  getActivity(projectId: string, page = 1, limit = 5): Observable<PaginatedResponse<ActivityLogItem>> {
    return this.api.getEnvelope<ActivityLogItem[]>(`/projects/${projectId}/activity`, { page, limit }).pipe(map((response) => this.normalizePaginated(response)));
  }

  changeMemberRole(projectId: string, userId: string, role: 'ADMIN' | 'MEMBER'): Observable<Project> {
    return this.api.patch<Project>(`/projects/${projectId}/members/${userId}/role`, { role });
  }

  removeMember(projectId: string, userId: string): Observable<Project> {
    return this.api.delete<Project>(`/projects/${projectId}/members/${userId}`);
  }

  private normalizePaginated(response: unknown): PaginatedResponse<ActivityLogItem> {
    if (response && typeof response === 'object' && 'data' in response) {
      const payload = response as { data?: unknown; meta?: PaginationMeta; summary?: Record<string, unknown> };
      return {
        data: Array.isArray(payload.data) ? (payload.data as ActivityLogItem[]) : [],
        meta: payload.meta || { page: 1, limit: 5, totalItems: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
        summary: payload.summary || {}
      };
    }

    return {
      data: [],
      meta: { page: 1, limit: 5, totalItems: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
      summary: {}
    };
  }
}
