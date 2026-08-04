import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_32%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-10">
      <div class="w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/90 shadow-[0_30px_70px_-30px_rgba(15,23,42,0.45)] backdrop-blur">
        <div class="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div class="hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-100">Northstar PM</p>
              <h1 class="mt-4 text-3xl font-semibold leading-tight">Bring strategy, delivery, and alignment into one calm workspace.</h1>
              <p class="mt-4 max-w-md text-sm leading-7 text-indigo-100/90">Coordinate projects, follow tasks, and keep your team shipping with clarity.</p>
            </div>
            <div class="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-indigo-50">
              <p class="font-medium">Trusted by focused teams</p>
              <p class="mt-1">Modern planning, polished collaboration, zero clutter.</p>
            </div>
          </div>
          <div class="p-8 sm:p-10 lg:p-12">
            <router-outlet />
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuthLayoutComponent {}
