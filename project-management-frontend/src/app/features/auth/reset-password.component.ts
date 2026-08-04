import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <div class="space-y-6">
      <div class="space-y-2">
        <div class="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">Secure access</div>
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Choose a new password</h1>
        <p class="text-sm leading-6 text-slate-500">Create a strong password for your account and get back to work safely.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm">
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">New Password</label>
          <input formControlName="password" type="password" class="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" placeholder="••••••••" />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">Confirm Password</label>
          <input formControlName="confirmPassword" type="password" class="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" placeholder="••••••••" />
        </div>

        <p *ngIf="message" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600">{{ message }}</p>
        <p *ngIf="error" class="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">{{ error }}</p>
        <button [disabled]="submitting" class="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 font-semibold text-white transition hover:from-emerald-700 hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-70" type="submit">
          <span>{{ submitting ? 'Updating…' : 'Reset password' }}</span>
        </button>
      </form>
    </div>
  `
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]]
  });

  message = '';
  error = '';
  submitting = false;

  submit(): void {
    this.error = '';
    this.message = '';
    if (this.form.invalid) {
      this.error = 'Please fill out both password fields.';
      return;
    }

    this.submitting = true;
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.authService.resetPassword(this.form.value as { password: string; confirmPassword: string }, token).subscribe({
      next: (done) => {
        this.submitting = false;
        if (done) {
          this.message = 'Password updated. You can now sign in.';
          setTimeout(() => this.router.navigate(['/login']), 1200);
        } else {
          this.error = 'Reset failed.';
        }
      },
      error: (err: Error) => {
        this.error = err.message;
        this.submitting = false;
      }
    });
  }
}
