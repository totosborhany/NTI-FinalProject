import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService } from '../../core/notifications.service';
import { NotificationItem } from '../../core/models';
import { UiService } from '../../core/ui.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-6 text-white shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-200">Notifications</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight">Stay informed without the noise</h1>
          <p class="mt-2 text-sm leading-6 text-indigo-100/90">A focused feed of project updates and response activity.</p>
        </div>
        <button (click)="markAsRead()" class="rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20">Mark all read</button>
      </div>

      <div *ngIf="loading" class="space-y-3">
        <div *ngFor="let i of [1,2,3]" class="h-24 animate-pulse rounded-[24px] bg-slate-100"></div>
      </div>

      <div *ngIf="error" class="rounded-[28px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{{ error }}</div>

      <div *ngIf="!loading" class="space-y-3">
        <div *ngIf="items.length === 0" class="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">You are all caught up.</div>
        <div *ngFor="let item of items" class="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-semibold text-slate-900">{{ item.title }}</p>
              <p class="mt-1 text-sm leading-6 text-slate-500">{{ item.message }}</p>
            </div>
            <span [class]="item.read ? 'bg-slate-100 text-slate-600' : 'bg-indigo-100 text-indigo-700'" class="rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide">{{ item.read ? 'Read' : 'Unread' }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  private readonly notificationsService = inject(NotificationsService);
  private readonly uiService = inject(UiService);
  private readonly cdr = inject(ChangeDetectorRef);

  items: NotificationItem[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.load();
  }

  markAsRead(): void {
    this.notificationsService.markAsRead().subscribe({
      next: () => {
        this.uiService.showToast('Notifications cleared', 'Everything is now marked as read.', 'success');
        this.load();
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.error = err.message;
        this.cdr.markForCheck();
      }
    });
  }

  private load(): void {
    this.loading = true;
    this.error = '';
    this.notificationsService.getNotifications().subscribe({
      next: (items) => {
        this.items = items;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.error = err.message;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
