import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Project } from '../../core/models';
import { ProjectsService } from '../../core/projects.service';
import { UiService } from '../../core/ui.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 p-6 text-white shadow-sm">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-200">Projects</p>
            <h1 class="mt-2 text-3xl font-semibold tracking-tight">Design, deliver, and align</h1>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-indigo-100/90">Keep your initiatives organized with a polished command center.</p>
          </div>
          <div class="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-indigo-50">
            <p class="font-medium">{{ projects.length }} active workspaces</p>
          </div>
        </div>
      </div>

      <div class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">Create project</h2>
            <p class="text-sm text-slate-500">Start a new workspace for your team.</p>
          </div>
        </div>
        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Name</label>
            <input formControlName="name" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100" placeholder="New initiative" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Description</label>
            <input formControlName="description" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100" placeholder="What is this project about?" />
          </div>
          <div class="md:col-span-2">
            <button [disabled]="submitting" class="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 font-semibold text-white transition hover:from-emerald-700 hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-70" type="submit">{{ submitting ? 'Creating…' : 'Create project' }}</button>
          </div>
        </form>
      </div>

      <div class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">Workspace library</h2>
            <p class="text-sm text-slate-500">Search and browse your projects with clarity.</p>
          </div>
          <div class="flex w-full max-w-md items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <span>🔎</span>
            <input [(ngModel)]="searchTerm" class="w-full bg-transparent text-sm outline-none" placeholder="Search projects" />
          </div>
        </div>

        <div *ngIf="loading" class="mt-5 grid gap-4 md:grid-cols-2">
          <div *ngFor="let i of [1,2]" class="h-36 animate-pulse rounded-3xl bg-slate-100"></div>
        </div>

        <div *ngIf="error" class="mt-5 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{{ error }}</div>

        <div *ngIf="!loading && filteredProjects.length === 0" class="mt-5 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">No projects match your search right now.</div>

        <div *ngIf="!loading && filteredProjects.length > 0" class="mt-5 grid gap-4 md:grid-cols-2">
          <div *ngFor="let project of pagedProjects" class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-semibold text-slate-900">{{ project.name }}</p>
                <p class="mt-1 text-sm leading-6 text-slate-500">{{ project.description || 'A collaborative workspace with everything you need to move work forward.' }}</p>
              </div>
              <span class="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">{{ project.visibility || 'Private' }}</span>
            </div>
            <div class="mt-4 flex items-center justify-between text-sm text-slate-500">
              <span>{{ project.members?.length || 0 }} members</span>
              <span>{{ project.status || 'Active' }}</span>
            </div>
            <div class="mt-4 flex gap-2">
              <a [routerLink]="['/projects', project._id]" class="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">Open</a>
              <button (click)="deleteProject(project._id)" class="rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50">Delete</button>
            </div>
          </div>
        </div>

        <div *ngIf="filteredProjects.length > 0" class="mt-6 flex items-center justify-between">
          <p class="text-sm text-slate-500">Showing {{ pagedProjects.length }} of {{ filteredProjects.length }} projects</p>
          <div class="flex items-center gap-2">
            <button (click)="prevPage()" [disabled]="page === 1" class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
            <button (click)="nextPage()" [disabled]="page * pageSize >= filteredProjects.length" class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProjectsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly projectsService = inject(ProjectsService);
  private readonly uiService = inject(UiService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly form = this.fb.group({
    name: ['', [Validators.required]],
    description: ['']
  });

  projects: Project[] = [];
  loading = true;
  error = '';
  submitting = false;
  searchTerm = '';
  page = 1;
  readonly pageSize = 4;

  ngOnInit(): void {
    this.load();
  }

  get filteredProjects(): Project[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.projects;
    }

    return this.projects.filter((project) => `${project.name} ${project.description ?? ''}`.toLowerCase().includes(term));
  }

  get pagedProjects(): Project[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredProjects.slice(start, start + this.pageSize);
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page -= 1;
    }
  }

  nextPage(): void {
    if (this.page * this.pageSize < this.filteredProjects.length) {
      this.page += 1;
    }
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.submitting = true;
    this.projectsService.createProject(this.form.value as { name: string; description?: string }).subscribe({
      next: () => {
        this.submitting = false;
        this.form.reset();
        this.uiService.showToast('Project created', 'Your new workspace is ready.', 'success');
        this.load();
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.submitting = false;
        this.error = err.message;
        this.cdr.markForCheck();
      }
    });
  }

  deleteProject(projectId: string): void {
    this.uiService.confirmAction({ title: 'Delete project', message: 'This will remove the project from your workspace. Continue?', confirmText: 'Delete', tone: 'danger' }).then((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.projectsService.deleteProject(projectId).subscribe({
        next: () => {
          this.uiService.showToast('Project removed', 'The workspace was deleted.', 'warning');
          this.load();
          this.cdr.markForCheck();
        },
        error: (err: Error) => {
          this.error = err.message;
          this.cdr.markForCheck();
        }
      });
    });
  }

  private load(): void {
    this.loading = true;
    this.error = '';
    this.projectsService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.loading = false;
        this.page = 1;
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.error = err.message;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
