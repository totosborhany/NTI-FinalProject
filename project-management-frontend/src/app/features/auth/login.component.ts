import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <div class="space-y-6">
      <div class="space-y-2">
        <div class="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">Welcome back</div>
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Sign in to your workspace</h1>
        <p class="text-sm leading-6 text-slate-500">Pick up where you left off and keep your projects moving.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm">
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">Email</label>
          <input formControlName="email" type="email" class="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" placeholder="you@company.com" />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">Password</label>
          <input formControlName="password" type="password" class="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" placeholder="••••••••" />
        </div>

        <p *ngIf="error" class="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">{{ error }}</p>

        <button [disabled]="submitting" class="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 font-semibold text-white transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-70" type="submit">
          <span>{{ submitting ? 'Signing in…' : 'Sign in' }}</span>
        </button>
      </form>

      <div class="flex items-center justify-between text-sm text-slate-500">
        <a routerLink="/forgot-password" class="font-medium transition hover:text-indigo-600">Forgot password?</a>
        <a routerLink="/register" class="font-medium transition hover:text-indigo-600">Create account</a>
      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  error = '';
  submitting = false;

  submit(): void {
    this.error = '';
    if (this.form.invalid) {
      this.error = 'Please complete both fields.';
      return;
    }

    this.submitting = true;
    this.authService.login(this.form.value as { email: string; password: string }).subscribe({
      next: (user) => {
        this.submitting = false;
        if (user) {
          this.router.navigate(['/dashboard']);
        } else {
          this.error = 'Unable to sign in right now.';
        }
      },
      error: (err: Error) => {
        this.error = err.message;
        this.submitting = false;
      }
    });
  }
}
