import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <div class="space-y-6">
      <div class="space-y-2">
        <div class="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">New here?</div>
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Create your workspace</h1>
        <p class="text-sm leading-6 text-slate-500">Join your team and start organizing projects in minutes.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm">
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">Username</label>
          <input formControlName="username" class="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" placeholder="Alex" />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">Email</label>
          <input formControlName="email" type="email" class="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" placeholder="you@company.com" />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">Password</label>
          <input formControlName="password" type="password" class="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" placeholder="••••••••" />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">Confirm Password</label>
          <input formControlName="confirmPassword" type="password" class="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" placeholder="••••••••" />
        </div>

        <p *ngIf="error" class="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">{{ error }}</p>
        <button [disabled]="submitting" class="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 font-semibold text-white transition hover:from-emerald-700 hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-70" type="submit">
          <span>{{ submitting ? 'Creating account…' : 'Create account' }}</span>
        </button>
      </form>

      <div class="text-center text-sm text-slate-500">
        <a routerLink="/login" class="font-medium transition hover:text-indigo-600">Already have an account?</a>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]]
  });

  error = '';
  submitting = false;

  submit(): void {
    this.error = '';
    if (this.form.invalid) {
      this.error = 'Please complete the form.';
      return;
    }

    this.submitting = true;
    this.authService.register(this.form.value as { username: string; email: string; password: string; confirmPassword: string }).subscribe({
      next: (user) => {
        this.submitting = false;
        if (user) {
          this.router.navigate(['/dashboard']);
        } else {
          this.error = 'Registration failed.';
        }
      },
      error: (err: Error) => {
        this.error = err.message;
        this.submitting = false;
      }
    });
  }
}
