import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<T>(path: string, params?: Record<string, unknown>): Observable<T> {
    return this.request<T>('GET', path, undefined, params);
  }

  getEnvelope<T>(path: string, params?: Record<string, unknown>): Observable<ApiResponse<T>> {
    return this.requestEnvelope<T>('GET', path, undefined, params);
  }

  post<T>(path: string, body?: unknown): Observable<T> {
    return this.request<T>('POST', path, body);
  }

  patch<T>(path: string, body?: unknown): Observable<T> {
    return this.request<T>('PATCH', path, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.request<T>('DELETE', path);
  }

  postFormData<T>(path: string, formData: FormData): Observable<T> {
    return this.http.post<ApiResponse<T> | T>(`${this.baseUrl}${path}`, formData, { withCredentials: true }).pipe(
      map((response) => this.unwrapResponse<T>(response)),
      catchError((error) => this.handleError(error))
    );
  }

  patchFormData<T>(path: string, formData: FormData): Observable<T> {
    // Use HttpClient.request so we can send FormData with a PATCH
    return this.http.request<ApiResponse<T> | T>('PATCH', `${this.baseUrl}${path}`, { body: formData, withCredentials: true }).pipe(
      map((response) => this.unwrapResponse<T>(response)),
      catchError((error) => this.handleError(error))
    );
  }

  private request<T>(method: string, path: string, body?: unknown, params?: Record<string, unknown>): Observable<T> {
    return this.requestEnvelope<T>(method, path, body, params).pipe(
      map((response) => response.data as T)
    );
  }

  private requestEnvelope<T>(method: string, path: string, body?: unknown, params?: Record<string, unknown>): Observable<ApiResponse<T>> {
    const headers = { 'Content-Type': 'application/json' };
    const httpParams = params ? new HttpParams({ fromObject: params as Record<string, string> }) : undefined;

    const makeRequest = () => this.http.request<ApiResponse<T> | T>(method, `${this.baseUrl}${path}`, {
      body,
      headers,
      params: httpParams,
      withCredentials: true
    });

    return makeRequest().pipe(
      map((response) => this.normalizeEnvelope<T>(response)),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.http.post<ApiResponse<unknown>>(`${this.baseUrl}/auth/refresh`, {}, { withCredentials: true }).pipe(
            switchMap(() => makeRequest()),
            map((response) => this.normalizeEnvelope<T>(response)),
            catchError((err) => this.handleError(err))
          );
        }

        return this.handleError(error);
      })
    );
  }

  private unwrapResponse<T>(response: ApiResponse<T> | T): T {
    return this.normalizeEnvelope<T>(response).data as T;
  }

  private normalizeEnvelope<T>(response: ApiResponse<T> | T): ApiResponse<T> {
    if (response && typeof response === 'object') {
      const candidate = response as Partial<ApiResponse<T>> & Record<string, unknown>;
      const looksLikeEnvelope = 'success' in candidate || 'message' in candidate || 'meta' in candidate || 'summary' in candidate || 'errors' in candidate;

      if (looksLikeEnvelope) {
        return {
          success: Boolean(candidate.success),
          message: (candidate.message as string) || 'Request succeeded',
          data: candidate.data as T,
          meta: candidate.meta as Record<string, unknown> | undefined,
          summary: candidate.summary as Record<string, unknown> | undefined,
          errors: candidate.errors as Record<string, unknown> | undefined
        };
      }
    }

    return {
      success: true,
      message: 'Request succeeded',
      data: response as T
    };
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message = error.error?.message || error.error?.errors?.message || error.message || 'Request failed';
    return throwError(() => new Error(message));
  }
}
