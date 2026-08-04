import { Injectable, signal } from '@angular/core';

export interface ToastItem {
  id: number;
  title: string;
  message: string;
  tone: 'success' | 'error' | 'info' | 'warning';
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  tone?: 'danger' | 'primary';
}

export interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class UiService {
  readonly toasts = signal<ToastItem[]>([]);
  readonly confirm = signal<PendingConfirm | null>(null);

  private id = 0;

  showToast(title: string, message: string, tone: ToastItem['tone'] = 'info'): void {
    const toast: ToastItem = { id: ++this.id, title, message, tone };
    this.toasts.update((items) => [...items, toast]);

    window.setTimeout(() => {
      this.toasts.update((items) => items.filter((item) => item.id !== toast.id));
    }, 3200);
  }

  confirmAction(options: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.confirm.set({ ...options, resolve, confirmText: options.confirmText ?? 'Confirm', cancelText: options.cancelText ?? 'Cancel', tone: options.tone ?? 'danger' });
    });
  }

  resolveConfirm(value: boolean): void {
    const pending = this.confirm();
    this.confirm.set(null);
    pending?.resolve(value);
  }
}
