import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { UsersService } from '../../core/users.service';
import { UiService } from '../../core/ui.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-6 text-white shadow-sm">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-200">Profile</p>
            <h1 class="mt-2 text-3xl font-semibold tracking-tight">Make the workspace feel like yours</h1>
            <p class="mt-2 text-sm leading-6 text-indigo-100/90">Keep your personal details current and protect your account with confidence.</p>
          </div>
          <div class="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-indigo-50">
            <p class="font-medium">{{ currentUser()?.username }}</p>
            <p class="mt-1">{{ currentUser()?.role }}</p>
          </div>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 class="text-lg font-semibold text-slate-900">Update profile</h2>
          <form [formGroup]="profileForm" (ngSubmit)="submitProfile()" class="mt-4 space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Username</label>
                <input formControlName="username" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">Avatar</label>
                <input type="file" (change)="onFileChange($event)" accept="image/*" class="w-full text-sm" />
            </div>
            <button [disabled]="savingProfile" class="rounded-2xl bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70" type="submit">{{ savingProfile ? 'Saving…' : 'Save profile' }}</button>
          </form>
        </section>

        <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 class="text-lg font-semibold text-slate-900">Change password</h2>
          <form [formGroup]="passwordForm" (ngSubmit)="submitPassword()" class="mt-4 space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Old password</label>
              <input formControlName="oldPassword" type="password" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">New password</label>
              <input formControlName="newPassword" type="password" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Confirm new password</label>
              <input formControlName="confirmNewPassword" type="password" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
            </div>
            <button [disabled]="changingPassword" class="rounded-2xl bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70" type="submit">{{ changingPassword ? 'Updating…' : 'Update password' }}</button>
          </form>
        </section>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly uiService = inject(UiService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly profileForm = this.fb.group({
    username: ['', [Validators.required]]
  });

  readonly passwordForm = this.fb.group({
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required]],
    confirmNewPassword: ['', [Validators.required]]
  });

  savingProfile = false;
  changingPassword = false;

  readonly currentUser = this.authService.currentUser;

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.username) {
      this.profileForm.patchValue({ username: user.username });
    }
  }

  submitProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.savingProfile = true;
    // If a file was selected, send multipart form data
    const file = (this as any).selectedAvatar as File | null;
    if (file) {
      const fd = new FormData();
      fd.append('avatar', file);
      const username = this.profileForm.value.username ?? '';
      fd.append('username', String(username));
      this.usersService.updateMe(fd).subscribe({
        next: () => this.onProfileSuccess(),
        error: (err: Error) => this.onProfileError(err)
      });
      return;
    }

    this.usersService.updateMe(this.profileForm.value).subscribe({
      next: () => {
        this.onProfileSuccess();
      },
      error: (err: Error) => {
        this.onProfileError(err);
      }
    });
  }

  onProfileSuccess(): void {
    this.savingProfile = false;
    const user = this.authService.currentUser();
    if (user) {
      this.authService.currentUser.set({ ...user, username: this.profileForm.value.username as string });
    }
    this.uiService.showToast('Profile updated', 'Your details were saved successfully.', 'success');
    this.cdr.markForCheck();
  }

  onProfileError(err: Error): void {
    this.savingProfile = false;
    this.uiService.showToast('Profile update failed', err.message, 'error');
    this.cdr.markForCheck();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length ? input.files[0] : null;
    (this as any).selectedAvatar = file;
  }

  submitPassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    this.changingPassword = true;
    this.authService.changePassword(this.passwordForm.value as { oldPassword: string; newPassword: string; confirmNewPassword: string }).subscribe({
      next: () => {
        this.changingPassword = false;
        this.passwordForm.reset();
        this.uiService.showToast('Password updated', 'Your password was changed.', 'success');
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.changingPassword = false;
        this.uiService.showToast('Password change failed', err.message, 'error');
        this.cdr.markForCheck();
      }
    });
  }
}
