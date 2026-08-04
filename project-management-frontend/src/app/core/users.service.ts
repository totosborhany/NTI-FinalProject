import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User } from './models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly api = inject(ApiService);

  getMe(): Observable<User> {
    return this.api.get<User>('/users/me');
  }

  updateMe(payload: Record<string, unknown> | FormData): Observable<User> {
    if (payload instanceof FormData) {
      return this.api.patchFormData<User>('/users/me', payload);
    }
    return this.api.patch<User>('/users/me', payload);
  }

  deleteMe(): Observable<User> {
    return this.api.delete<User>('/users/me');
  }

  getUsers(): Observable<User[]> {
    return this.api.get<User[]>('/users/');
  }

  createUser(payload: { username: string; email: string; password: string; confirmPassword: string; role?: string }): Observable<User> {
    return this.api.post<User>('/users/', payload);
  }

  updateUser(userId: string, payload: Record<string, unknown>): Observable<User> {
    return this.api.patch<User>(`/users/${userId}`, payload);
  }

  deleteUser(userId: string): Observable<User> {
    return this.api.delete<User>(`/users/${userId}`);
  }
}
