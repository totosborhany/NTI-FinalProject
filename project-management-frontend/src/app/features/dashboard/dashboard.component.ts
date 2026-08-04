import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { NotificationsService } from '../../core/notifications.service';
import { ProjectsService } from '../../core/projects.service';
import { TasksService } from '../../core/tasks.service';
import { PaginationMeta, Project, Task, NotificationItem } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-6 text-white shadow-[0_24px_60px_-25px_rgba(15,23,42,0.7)]">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-200">Operations overview</p>
            <h1 class="mt-2 text-3xl font-semibold tracking-tight">Welcome back, {{ currentUser()?.username }}.</h1>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-indigo-100/90">A calm view of your active projects, open work, and the latest activity in your workspace.</p>
          </div>
          <div class="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-indigo-50">
            <p class="font-medium">Healthy momentum</p>
            <p class="mt-1">{{ completedTasks }} of {{ tasks.length }} tasks completed</p>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div *ngFor="let i of [1,2,3,4]" class="h-28 animate-pulse rounded-3xl bg-slate-100"></div>
      </div>

      <div *ngIf="error" class="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{{ error }}</div>

      <div *ngIf="!loading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-slate-500">Projects</p>
            <div class="rounded-2xl bg-indigo-50 p-2 text-indigo-600">🧩</div>
          </div>
          <p class="mt-4 text-3xl font-semibold text-slate-900">{{ projects.length }}</p>
          <p class="mt-2 text-sm text-slate-500">Active initiatives</p>
        </div>
        <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-slate-500">Tasks</p>
            <div class="rounded-2xl bg-amber-50 p-2 text-amber-600">✓</div>
          </div>
          <p class="mt-4 text-3xl font-semibold text-slate-900">{{ tasks.length }}</p>
          <p class="mt-2 text-sm text-slate-500">Open work items</p>
        </div>
        <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-slate-500">Completed</p>
            <div class="rounded-2xl bg-emerald-50 p-2 text-emerald-600">●</div>
          </div>
          <p class="mt-4 text-3xl font-semibold text-slate-900">{{ completedTasks }}</p>
          <p class="mt-2 text-sm text-slate-500">Finished this week</p>
        </div>
        <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-slate-500">Unread</p>
            <div class="rounded-2xl bg-rose-50 p-2 text-rose-600">🔔</div>
          </div>
          <p class="mt-4 text-3xl font-semibold text-slate-900">{{ unreadNotifications }}</p>
          <p class="mt-2 text-sm text-slate-500">Notifications waiting</p>
        </div>
      </div>

      <div class="grid gap-6 xl:grid-cols-2">
        <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Recent projects</h2>
              <p class="text-sm text-slate-500">The workstreams that need the most attention.</p>
            </div>
            <a routerLink="/projects" class="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700">View all</a>
          </div>
          <div *ngIf="projects.length === 0" class="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">No projects yet. Create one to get started.</div>
          <div *ngIf="projects.length > 0" class="space-y-3">
            <div *ngFor="let project of projects.slice(0, 3)" class="rounded-2xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="font-semibold text-slate-900">{{ project.name }}</p>
                  <p class="mt-1 text-sm text-slate-500">{{ project.description || 'A focused team initiative' }}</p>
                </div>
                <a [routerLink]="['/projects', project._id]" class="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100">Open</a>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Upcoming tasks</h2>
              <p class="text-sm text-slate-500">The next important actions in your queue.</p>
            </div>
            <a routerLink="/projects" class="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700">Open board</a>
          </div>
          <div *ngIf="tasks.length === 0" class="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">No tasks assigned yet.</div>
          <div *ngIf="tasks.length > 0" class="space-y-3">
            <div *ngFor="let task of tasks" class="rounded-2xl border border-slate-200 p-4 transition hover:border-violet-200 hover:shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="font-semibold text-slate-900">{{ task.title }}</p>
                  <p class="mt-1 text-sm text-slate-500">{{ task.status }}</p>
                </div>
                <span class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">{{ task.priority }}</span>
              </div>
            </div>
          </div>
          <div *ngIf="taskMeta" class="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
            <span>Page {{ taskMeta.page }} of {{ taskMeta.totalPages || 1 }}</span>
            <div class="flex items-center gap-2">
              <button (click)="goToTaskPage(taskMeta.page - 1)" [disabled]="!taskMeta.hasPreviousPage" class="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
              <button (click)="goToTaskPage(taskMeta.page + 1)" [disabled]="!taskMeta.hasNextPage" class="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly projectsService = inject(ProjectsService);
  private readonly tasksService = inject(TasksService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly cdr = inject(ChangeDetectorRef); // Injected CDR to force UI render

  readonly currentUser = this.authService.currentUser;
  projects: Project[] = [];
  tasks: Task[] = [];
  notifications: NotificationItem[] = [];
  taskMeta: PaginationMeta | null = null;
  taskPage = 1;
  taskPageSize = 6;
  loading = true;
  error = '';

  ngOnInit(): void {
    this.load();
  }

  get completedTasks(): number {
    return this.tasks.filter((task) => task.status === 'DONE').length;
  }

  get unreadNotifications(): number {
    return this.notifications.filter((item) => !item.read).length;
  }

  goToTaskPage(page: number): void {
    if (!page || page < 1 || (this.taskMeta && page > this.taskMeta.totalPages)) {
      return;
    }

    this.taskPage = page;
    this.loadTasks();
  }

  private load(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      projects: this.projectsService.getProjects(),
      notifications: this.notificationsService.getNotifications()
    }).subscribe({
      next: (res) => {
        this.projects = res.projects;
        this.notifications = res.notifications;
        this.loadTasks();
      },
      error: (err: Error) => {
        this.error = err.message || 'Failed to fetch data';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private loadTasks(): void {
    this.tasksService.getMyTasks(this.taskPage, this.taskPageSize).subscribe({
      next: (res) => {
        this.tasks = res.data;
        this.taskMeta = res.meta;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.error = err.message || 'Failed to fetch tasks';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}