import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../../core/users.service';
import { User } from '../../core/models';
import { UiService } from '../../core/ui.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div *ngIf="!isAdmin()" class="rounded-[28px] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700">You do not have permission to access the admin area.</div>

  <div *ngIf="isAdmin()" class="space-y-6">
      <div class="rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-6 text-white shadow-sm">
        <p class="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-200">Admin</p>
        <h1 class="mt-2 text-3xl font-semibold tracking-tight">Command center for workspace access</h1>
        <p class="mt-2 text-sm leading-6 text-indigo-100/90">Create accounts and keep a clear view of every teammate in the workspace.</p>
      </div>

      <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-900">Create user</h2>
        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Username</label>
            <input formControlName="username" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input formControlName="email" type="email" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input formControlName="password" type="password" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Confirm password</label>
            <input formControlName="confirmPassword" type="password" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
          </div>
          <div class="md:col-span-2">
            <button [disabled]="submitting" class="rounded-2xl bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70" type="submit">{{ submitting ? 'Creating…' : 'Create user' }}</button>
          </div>
        </form>
      </section>

      <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">Users</h2>
            <p class="text-sm text-slate-500">A live snapshot of workspace members.</p>
          </div>
          <div class="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">{{ users.length }}</div>
        </div>
        <div *ngIf="loading" class="mt-4 space-y-3">
          <div *ngFor="let i of [1,2,3]" class="h-16 animate-pulse rounded-2xl bg-slate-100"></div>
        </div>
        <div *ngIf="!loading" class="mt-4 space-y-3">
          <div *ngFor="let user of users" class="flex items-center justify-between rounded-3xl border border-slate-200 p-4">
            <div>
              <p class="font-semibold text-slate-900">{{ user.username }}</p>
              <p class="text-sm text-slate-500">{{ user.email }}</p>
            </div>
                <div class="flex items-center gap-3">
                  <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">{{ user.role }}</span>
                  <button (click)="deactivate(user._id)" class="rounded-xl border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700">Deactivate</button>
                </div>
          </div>
        </div>
      </section>
    </div>
  `
})
export class AdminComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly uiService = inject(UiService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly isAdmin = this.authService.isAdmin;

  readonly form = this.fb.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]]
  });

  users: User[] = [];
  loading = true;
  submitting = false;

  ngOnInit(): void {
    this.load();
  }

  deactivate(userId: string): void {
    this.uiService.showToast('Removing user', 'Requesting deactivation…', 'info');
    this.usersService.deleteUser(userId).subscribe({
      next: () => {
        this.uiService.showToast('User deactivated', 'The user has been deactivated.', 'success');
        this.load();
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.uiService.showToast('Failed', err.message, 'error');
        this.cdr.markForCheck();
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.submitting = true;
    this.usersService.createUser(this.form.value as { username: string; email: string; password: string; confirmPassword: string }).subscribe({
      next: () => {
        this.submitting = false;
        this.form.reset();
        this.load();
        this.uiService.showToast('User created', 'A new workspace member was added.', 'success');
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.submitting = false;
        this.uiService.showToast('Unable to create user', err.message, 'error');
        this.cdr.markForCheck();
      }
    });
  }

  private load(): void {
    this.loading = true;
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
