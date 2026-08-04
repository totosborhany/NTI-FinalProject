import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { NotificationItem } from './models';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly api = inject(ApiService);

  getNotifications(): Observable<NotificationItem[]> {
    return this.api.get<NotificationItem[]>('/notifications/');
  }

  markAsRead(): Observable<unknown> {
    return this.api.patch('/notifications/read');
  }
}
