import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth.service';
import { UiService } from './ui.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-900">
      <!-- Top Navbar -->
      <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-sm">
              PM
            </div>
            <div>
              <p class="text-base font-semibold leading-none tracking-tight">Northstar PM</p>
              <p class="text-xs text-slate-400 mt-1">Progress, focus, delivery</p>
            </div>
          </div>

          <!-- User Actions -->
          <div class="flex items-center gap-4">
            <a routerLink="/notifications" class="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition">
              <span class="text-base">🔔</span>
              <span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500"></span>
            </a>

            <div class="flex items-center gap-2.5 border-l border-slate-200 pl-4">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {{ currentUser()?.username?.slice(0, 1)?.toUpperCase() }}
              </div>
              <div class="hidden sm:block">
                <p class="text-xs font-semibold leading-tight">{{ currentUser()?.username }}</p>
                <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{{ currentUser()?.role }}</p>
              </div>
            </div>

            <button (click)="logout()" class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition">
              Logout
            </button>
          </div>
        </div>
      </header>

      <!-- Main Layout Body -->
      <div class="mx-auto flex max-w-7xl gap-8 px-6 py-8">
        <!-- Sidebar Navigation -->
        <aside class="w-64 shrink-0">
          <nav class="space-y-1">
            @for (item of navItems; track item.route) {
              <a 
                [routerLink]="item.route" 
                routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold" 
                [routerLinkActiveOptions]="{ exact: true }" 
                class="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
                <span class="text-base">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
              </a>
            }
            @if (isAdmin()) {
              <a 
                routerLink="/admin" 
                routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold" 
                [routerLinkActiveOptions]="{ exact: true }" 
                class="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
                <span class="text-base">🛡️</span>
                <span>Admin</span>
              </a>
            }
          </nav>
        </aside>

        <!-- Main Workspace -->
        <main class="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly uiService = inject(UiService);

  readonly currentUser = this.authService.currentUser;
  readonly isAdmin = this.authService.isAdmin;
  readonly navItems = [
    { label: 'Dashboard', route: '/dashboard', icon: '📊' },
    { label: 'Projects', route: '/projects', icon: '🧩' },
    { label: 'Invitations', route: '/invitations', icon: '✉️' },
    { label: 'Notifications', route: '/notifications', icon: '🔔' },
    { label: 'Profile', route: '/profile', icon: '👤' }
  ];

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.uiService.showToast('Signed out', 'You were signed out successfully.', 'info');
        this.router.navigate(['/login']);
      }
    });
  }
}