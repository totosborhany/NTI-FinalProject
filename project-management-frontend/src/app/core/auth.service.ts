import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { ApiService } from './api.service';
import { User } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = signal(false);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  initialize(): Observable<User | null> {
    return this.api.get<User>('/users/me').pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      }),
      catchError(() => {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        return of(null);
      })
    );
  }

  login(payload: { email: string; password: string }): Observable<User | null> {
    return this.api.post<{ success: boolean; message: string }>('/auth/login', payload).pipe(
      switchMap(() => this.initialize()),
      catchError(() => {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        return of(null);
      })
    );
  }

  register(payload: { username: string; email: string; password: string; confirmPassword: string }): Observable<User | null> {
    return this.api.post<{ success: boolean; message: string }>('/auth/register', payload).pipe(
      switchMap(() => this.initialize()),
      catchError(() => {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        return of(null);
      })
    );
  }

  forgotPassword(payload: { email: string }): Observable<boolean> {
    return this.api.post<{ success: boolean; message: string }>('/users/forgot-password', payload).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  resetPassword(payload: { password: string; confirmPassword: string }, token: string): Observable<boolean> {
    const params = token ? { token } : {};
    return this.api.post<{ success: boolean; message: string }>(`/users/reset-password?token=${token}`, payload).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  logout(): Observable<boolean> {
    return this.api.post<{ success: boolean; message: string }>('/auth/logout').pipe(
      map(() => {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        return true;
      }),
      catchError(() => {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        return of(false);
      })
    );
  }

  changePassword(payload: { oldPassword: string; newPassword: string; confirmNewPassword: string }): Observable<boolean> {
    return this.api.patch<{ success: boolean; message: string }>('/users/password', payload).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
