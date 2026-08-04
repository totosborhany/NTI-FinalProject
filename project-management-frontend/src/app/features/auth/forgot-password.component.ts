import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <div class="space-y-6">
      <div class="space-y-2">
        <div class="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">Password reset</div>
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Recover access</h1>
        <p class="text-sm leading-6 text-slate-500">Enter the email tied to your account and we’ll send you a reset link.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm">
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">Email</label>
          <input formControlName="email" type="email" class="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" placeholder="you@company.com" />
        </div>

        <p *ngIf="message" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600">{{ message }}</p>
        <p *ngIf="error" class="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">{{ error }}</p>
        <button [disabled]="submitting" class="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 font-semibold text-white transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-70" type="submit">
          <span>{{ submitting ? 'Sending…' : 'Send reset link' }}</span>
        </button>
      </form>

      <a routerLink="/login" class="text-sm font-medium text-slate-500 transition hover:text-indigo-600">Back to login</a>
    </div>
  `
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  message = '';
  error = '';
  submitting = false;

  submit(): void {
    this.error = '';
    this.message = '';
    if (this.form.invalid) {
      this.error = 'Please enter a valid email address.';
      return;
    }

    this.submitting = true;
    this.authService.forgotPassword(this.form.value as { email: string }).subscribe({
      next: (done) => {
        this.submitting = false;
        this.message = done ? 'Check your inbox for the reset link.' : 'We could not process the request.';
      },
      error: (err: Error) => {
        this.error = err.message;
        this.submitting = false;
      }
    });
  }
}
