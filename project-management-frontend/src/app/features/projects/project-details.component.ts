import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivityLogItem, AttachmentModel, CommentModel, PaginationMeta, Project, ProjectMember, Task, User } from '../../core/models';
import { forkJoin, of, switchMap } from 'rxjs';
import { ProjectsService } from '../../core/projects.service';
import { TasksService } from '../../core/tasks.service';
import { InvitationsService } from '../../core/invitations.service';
import { UiService } from '../../core/ui.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-8">
      <header class="overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 p-8 text-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.9)]">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-3xl">
            <a routerLink="/projects" class="inline-flex items-center text-sm font-semibold text-indigo-200 transition hover:text-white">← Back to projects</a>
            <h1 class="mt-3 text-4xl font-semibold tracking-tight">{{ project?.name || 'Project workspace' }}</h1>
            <p class="mt-3 max-w-2xl text-base leading-7 text-indigo-100/90">{{ project?.description || 'A focused workspace for tracking delivery, collaboration, and momentum.' }}</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <div class="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
              <p class="text-sm text-indigo-100">Status</p>
              <p class="mt-1 font-semibold">{{ project?.status || 'Active' }}</p>
            </div>
            <button *ngIf="canEditProject" (click)="toggleProjectEdit()" class="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20">{{ editingProject ? 'Cancel edit' : 'Edit project' }}</button>
          </div>
        </div>
      </header>

      <div *ngIf="loading" class="h-44 animate-pulse rounded-[32px] bg-slate-100"></div>
      <div *ngIf="error" class="rounded-[32px] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{{ error }}</div>

      <div *ngIf="project" class="space-y-8">
        <section class="rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
          <div class="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <div>
              <div class="flex flex-wrap items-center gap-3">
                <span class="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">{{ project.visibility || 'Private' }}</span>
                <span class="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{{ project.status || 'Active' }}</span>
              </div>
              <div class="mt-6 grid gap-4 md:grid-cols-3">
                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p class="text-sm text-slate-500">Members</p>
                  <p class="mt-2 text-3xl font-semibold text-slate-900">{{ members.length }}</p>
                </div>
                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p class="text-sm text-slate-500">Tasks</p>
                  <p class="mt-2 text-3xl font-semibold text-slate-900">{{ taskMeta?.totalItems || tasks.length }}</p>
                </div>
                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p class="text-sm text-slate-500">Owner</p>
                  <p class="mt-2 text-sm font-semibold text-slate-900">{{ getProjectOwnerName() }}</p>
                </div>
              </div>

              <form *ngIf="editingProject" [formGroup]="projectForm" (ngSubmit)="saveProject()" class="mt-8 grid gap-4 md:grid-cols-2">
                <div>
                  <label class="mb-2 block text-sm font-medium text-slate-700">Name</label>
                  <input formControlName="name" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm" />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-slate-700">Visibility</label>
                  <select formControlName="visibility" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm">
                    <option value="Private">Private</option>
                    <option value="Public">Public</option>
                  </select>
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-slate-700">Status</label>
                  <select formControlName="status" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm">
                    <option value="Active">Active</option>
                    <option value="Planning">Planning</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-slate-700">Color</label>
                  <input formControlName="color" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm" />
                </div>
                <div class="md:col-span-2">
                  <label class="mb-2 block text-sm font-medium text-slate-700">Description</label>
                  <textarea formControlName="description" rows="3" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm"></textarea>
                </div>
                <div class="md:col-span-2">
                  <button [disabled]="savingProject" type="submit" class="rounded-2xl bg-indigo-600 px-4 py-2.5 font-semibold text-white">{{ savingProject ? 'Saving…' : 'Save project' }}</button>
                </div>
              </form>
            </div>

            <div class="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <h2 class="text-lg font-semibold text-slate-900">Invite teammate</h2>
              <p class="mt-2 text-sm leading-6 text-slate-500">Bring a collaborator into the workspace.</p>
              <form [formGroup]="inviteForm" (ngSubmit)="sendInvitation()" class="mt-4 space-y-3">
                <input formControlName="recieverEmail" class="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm" placeholder="email@example.com" />
                <button [disabled]="inviting" class="w-full rounded-2xl bg-indigo-600 px-4 py-2.5 font-semibold text-white" type="submit">{{ inviting ? 'Sending…' : 'Send invitation' }}</button>
              </form>
            </div>
          </div>
        </section>

        <div class="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div class="space-y-8">
            <section class="rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-xl font-semibold text-slate-900">Activity timeline</h2>
                  <p class="mt-1 text-sm text-slate-500">A clear record of project milestones, updates, and team actions.</p>
                </div>
              </div>
              <div class="mt-6 space-y-3">
                <div *ngIf="activity.length === 0" class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">No activity yet.</div>
                <div *ngFor="let item of activity" class="flex gap-3 rounded-2xl border border-slate-200 p-4">
                  <div class="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-xl">{{ getActivityIcon(item.type) }}</div>
                  <div class="min-w-0 flex-1">
                    <p class="font-semibold text-slate-900">{{ item.message }}</p>
                    <p class="mt-1 text-sm text-slate-500">{{ getActorName(item.actor) }} • {{ item.createdAt | date:'medium' }}</p>
                  </div>
                </div>
              </div>
              <div *ngIf="activityMeta" class="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                <span>Page {{ activityMeta.page }} of {{ activityMeta.totalPages || 1 }}</span>
                <div class="flex items-center gap-2">
                  <button (click)="goToActivityPage(activityMeta.page - 1)" [disabled]="!activityMeta.hasPreviousPage" class="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
                  <button (click)="goToActivityPage(activityMeta.page + 1)" [disabled]="!activityMeta.hasNextPage" class="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
                </div>
              </div>
            </section>

            <section class="rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-xl font-semibold text-slate-900">Kanban board</h2>
                  <p class="mt-1 text-sm text-slate-500">Move work through the delivery pipeline and open any task for details.</p>
                </div>
              </div>
              <div class="mt-6 grid gap-4 xl:grid-cols-3">
                <div *ngFor="let column of columns" class="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div class="mb-3 flex items-center justify-between">
                    <h3 class="font-semibold text-slate-900">{{ column.label }}</h3>
                    <span class="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500">{{ getTasksForColumn(column.key).length }}</span>
                  </div>
                  <div class="space-y-3">
                    <div *ngIf="getTasksForColumn(column.key).length === 0" class="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-center text-sm text-slate-500">No tasks here yet.</div>
                    <button *ngFor="let task of getTasksForColumn(column.key)" type="button" (click)="selectTask(task)" class="w-full rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md">
                      <p class="font-semibold text-slate-900">{{ task.title }}</p>
                      <p class="mt-1 text-sm leading-6 text-slate-500">{{ task.description || 'Work item in progress.' }}</p>
                      <div class="mt-3 flex items-center justify-between text-xs">
                        <span class="rounded-full bg-amber-100 px-2 py-1 font-semibold uppercase tracking-wide text-amber-700">{{ task.priority }}</span>
                        <span class="font-semibold text-indigo-600">Open</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              <div *ngIf="taskMeta" class="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                <span>Page {{ taskMeta.page }} of {{ taskMeta.totalPages || 1 }}</span>
                <div class="flex items-center gap-2">
                  <button (click)="goToTaskPage(taskMeta.page - 1)" [disabled]="!taskMeta.hasPreviousPage" class="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
                  <button (click)="goToTaskPage(taskMeta.page + 1)" [disabled]="!taskMeta.hasNextPage" class="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
                </div>
              </div>
            </section>
          </div>

          <div class="space-y-8">
            <section class="rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-xl font-semibold text-slate-900">Create task</h2>
                  <p class="mt-1 text-sm text-slate-500">Add a new item to keep delivery moving.</p>
                </div>
              </div>
              <form [formGroup]="taskForm" (ngSubmit)="createTask()" class="mt-6 grid gap-4">
                <div>
                  <label class="mb-2 block text-sm font-medium text-slate-700">Title</label>
                  <input formControlName="title" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm" placeholder="Design review" />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-slate-700">Description</label>
                  <input formControlName="description" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm" placeholder="Add key details" />
                </div>
                <div class="grid gap-4 md:grid-cols-2">
                  <div>
                    <label class="mb-2 block text-sm font-medium text-slate-700">Status</label>
                    <select formControlName="status" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm">
                      <option value="TODO">Todo</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                  <div>
                    <label class="mb-2 block text-sm font-medium text-slate-700">Priority</label>
                    <select formControlName="priority" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm">
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>
                <button [disabled]="submitting" class="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 font-semibold text-white" type="submit">{{ submitting ? 'Creating…' : 'Create task' }}</button>
              </form>
            </section>

            <section class="rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-xl font-semibold text-slate-900">Members</h2>
                  <p class="mt-1 text-sm text-slate-500">Collaborators and their roles.</p>
                </div>
              </div>
              <ul class="mt-5 space-y-3">
                <li *ngFor="let member of members" class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <span class="font-medium text-slate-700">{{ getMemberName(member) }}</span>
                  <span class="text-sm text-slate-500">{{ member.role }}</span>
                </li>
              </ul>
            </section>
          </div>
        </div>

        <section *ngIf="selectedTask" class="rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)]">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">Task details</p>
              <h2 class="mt-2 text-3xl font-semibold text-slate-900">{{ selectedTask.title }}</h2>
              <p class="mt-3 max-w-2xl text-base leading-7 text-slate-600">{{ selectedTask.description || 'Keep this task grounded in clear next steps and visible ownership.' }}</p>
            </div>
            <button (click)="selectedTask = null" class="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Close</button>
          </div>

          <div class="mt-8 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <div class="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <div class="flex flex-wrap gap-3">
                <span class="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700">{{ selectedTask.status }}</span>
                <span class="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-amber-700">{{ selectedTask.priority }}</span>
              </div>
              <form [formGroup]="editTaskForm" (ngSubmit)="saveSelectedTask()" class="mt-6 grid gap-4">
                <div>
                  <label class="mb-2 block text-sm font-medium text-slate-700">Title</label>
                  <input formControlName="title" class="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm" />
                </div>
                <div class="grid gap-4 md:grid-cols-2">
                  <div>
                    <label class="mb-2 block text-sm font-medium text-slate-700">Status</label>
                    <select formControlName="status" class="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm">
                      <option value="TODO">Todo</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                  <div>
                    <label class="mb-2 block text-sm font-medium text-slate-700">Priority</label>
                    <select formControlName="priority" class="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm">
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>
                <div class="grid gap-4 md:grid-cols-2">
                  <div>
                    <label class="mb-2 block text-sm font-medium text-slate-700">Due date</label>
                    <input type="date" formControlName="dueDate" class="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label class="mb-2 block text-sm font-medium text-slate-700">Assignee (email)</label>
                    <input formControlName="assignee" class="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm" />
                  </div>
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-slate-700">Labels</label>
                  <input formControlName="labels" class="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm" placeholder="Design,UI" />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-slate-700">Description</label>
                  <textarea formControlName="description" rows="4" class="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"></textarea>
                </div>
                <button [disabled]="savingTask" type="submit" class="rounded-2xl bg-indigo-600 px-4 py-2.5 font-semibold text-white">{{ savingTask ? 'Saving…' : 'Save task' }}</button>
              </form>

              <div class="mt-8 border-t border-slate-200 pt-6">
                <h3 class="text-lg font-semibold text-slate-900">Task overview</h3>
                <dl class="mt-4 space-y-3 text-sm text-slate-600">
                  <div class="flex justify-between gap-3"><dt class="font-medium text-slate-500">Creator</dt><dd>{{ getUserName(selectedTask.creator) }}</dd></div>
                  <div class="flex justify-between gap-3"><dt class="font-medium text-slate-500">Assignee</dt><dd>{{ getUserName(selectedTask.assignee) }}</dd></div>
                  <div class="flex justify-between gap-3"><dt class="font-medium text-slate-500">Due date</dt><dd>{{ selectedTask.dueDate ? (selectedTask.dueDate | date) : '—' }}</dd></div>
                  <div class="flex justify-between gap-3"><dt class="font-medium text-slate-500">Labels</dt><dd>{{ (selectedTask.labels || []).join(', ') || '—' }}</dd></div>
                </dl>
              </div>
            </div>

            <div class="space-y-6">
              <section class="rounded-[28px] border border-slate-200 bg-white p-6">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-slate-900">Comments</h3>
                </div>
                <form [formGroup]="commentForm" (ngSubmit)="postComment()" class="mt-4 space-y-3">
                  <textarea formControlName="content" rows="4" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm" placeholder="Add a comment"></textarea>
                  <button [disabled]="postingComment" type="submit" class="rounded-2xl bg-emerald-600 px-4 py-2.5 font-semibold text-white">{{ postingComment ? 'Posting…' : 'Post comment' }}</button>
                </form>
                <div class="mt-5 space-y-3">
                  <div *ngIf="getTaskComments(selectedTask).length === 0" class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No comments yet.</div>
                  <div *ngFor="let comment of getTaskComments(selectedTask)" class="rounded-2xl border border-slate-200 p-4">
                    <div class="flex items-center gap-3">
                      <div *ngIf="getUserAvatar(comment.author) as avatar" class="h-10 w-10 overflow-hidden rounded-full border border-slate-200">
                        <img [src]="avatar" alt="Avatar" class="h-full w-full object-cover" />
                      </div>
                      <div *ngIf="!getUserAvatar(comment.author)" class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">{{ getUserInitials(comment.author) }}</div>
                      <div>
                        <p class="font-semibold text-slate-900">{{ getUserName(comment.author) }}</p>
                        <p class="text-sm text-slate-500">{{ comment.createdAt | date:'medium' }}</p>
                      </div>
                    </div>
                    <p class="mt-3 text-sm leading-7 text-slate-600">{{ comment.content }}</p>
                  </div>
                </div>
              </section>

              <section class="rounded-[28px] border border-slate-200 bg-white p-6">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-slate-900">Attachments</h3>
                  <label class="cursor-pointer rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                    <input type="file" class="hidden" (change)="onAttachmentFileChange($event)" />
                    Upload
                  </label>
                </div>
                <div class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <button *ngIf="attachmentFile" [disabled]="uploadingAttachment" (click)="uploadAttachment()" class="rounded-2xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">{{ uploadingAttachment ? 'Uploading…' : 'Submit attachment' }}</button>
                  <div class="mt-4 space-y-3">
                    <div *ngIf="getTaskAttachments(selectedTask).length === 0" class="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-500">No attachments yet.</div>
                    <div *ngFor="let attachment of getTaskAttachments(selectedTask)" class="rounded-2xl border border-slate-200 bg-white p-4">
                      <div class="flex flex-wrap items-start justify-between gap-3">
                        <div class="flex items-center gap-3">
                          <div *ngIf="getUserAvatar(attachment.uploadedBy) as avatar" class="h-10 w-10 overflow-hidden rounded-full border border-slate-200">
                            <img [src]="avatar" alt="Avatar" class="h-full w-full object-cover" />
                          </div>
                          <div *ngIf="!getUserAvatar(attachment.uploadedBy)" class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">{{ getUserInitials(attachment.uploadedBy) }}</div>
                          <div>
                            <p class="font-semibold text-slate-900">{{ attachment.originalName || attachment.fileName || 'Attachment' }}</p>
                            <p class="mt-1 text-sm text-slate-500">{{ getUserName(attachment.uploadedBy) }} • {{ attachment.createdAt | date:'medium' }}</p>
                          </div>
                        </div>
                        <div class="flex gap-2">
                          <a [href]="attachment.url" target="_blank" class="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">Open</a>
                          <button (click)="deleteAttachment(attachment)" class="rounded-2xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700">Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </div>
  `
})
export class ProjectDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly projectsService = inject(ProjectsService);
  private readonly tasksService = inject(TasksService);
  private readonly invitationsService = inject(InvitationsService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly uiService = inject(UiService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly projectForm = this.fb.group({
    name: ['', [Validators.required]],
    description: [''],
    visibility: ['Private'],
    status: ['Active'],
    color: ['']
  });

  readonly taskForm = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    status: ['TODO'],
    priority: ['MEDIUM']
  });

  readonly editTaskForm = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    status: ['TODO'],
    priority: ['MEDIUM'],
    dueDate: [''],
    assignee: [''],
    labels: ['']
  });

  readonly commentForm = this.fb.group({
    content: ['', [Validators.required]]
  });

  readonly inviteForm = this.fb.group({
    recieverEmail: ['', [Validators.required, Validators.email]]
  });

  project: Project | null = null;
  members: ProjectMember[] = [];
  tasks: Task[] = [];
  activity: ActivityLogItem[] = [];
  selectedTask: Task | null = null;
  loading = true;
  error = '';
  submitting = false;
  inviting = false;
  savingProject = false;
  savingTask = false;
  postingComment = false;
  uploadingAttachment = false;
  editingProject = false;
  attachmentFile: File | null = null;
  taskPage = 1;
  taskPageSize = 6;
  activityPage = 1;
  activityPageSize = 5;
  taskMeta: PaginationMeta | null = null;
  activityMeta: PaginationMeta | null = null;
  taskSummary: Record<string, unknown> = {};
  activitySummary: Record<string, unknown> = {};
  readonly columns = [
    { key: 'TODO', label: 'Todo' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'DONE', label: 'Done' }
  ];

  private currentProjectId: string | null = null;

  get canEditProject(): boolean {
    if (!this.project) {
      return false;
    }

    const currentUser = this.authService.currentUser();
    const currentUserId = currentUser?._id;
    if (!currentUserId) {
      return false;
    }

    const ownerId = typeof this.project.owner === 'string' ? this.project.owner : this.project.owner?._id;
    if (ownerId === currentUserId) {
      return true;
    }

    const member = this.members.find((entry) => {
      const memberId = typeof entry.user === 'string' ? entry.user : entry.user?._id;
      return memberId === currentUserId;
    });

    return member?.role === 'OWNER' || member?.role === 'ADMIN';
  }

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (!projectId) {
      return;
    }

    this.load(projectId);
  }

  getMemberName(member: ProjectMember): string {
    if (typeof member.user === 'string') {
      return member.user;
    }
    return member.user?.username || 'Member';
  }

  getProjectOwnerName(): string {
    if (!this.project) {
      return '—';
    }

    return typeof this.project.owner === 'string' ? this.project.owner : this.project.owner?.username || 'Owner';
  }

  getUserName(user: User | string | undefined | null): string {
    if (!user) {
      return 'Unassigned';
    }

    return typeof user === 'string' ? user : user.username || 'User';
  }

  getUserAvatar(user: User | string | undefined | null): string | null {
    if (!user || typeof user === 'string') {
      return null;
    }

    return user.avatar || null;
  }

  getUserInitials(user: User | string | undefined | null): string {
    const name = this.getUserName(user);
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';
  }

  getActivityIcon(type: string): string {
    if (type.includes('TASK')) return '✅';
    if (type.includes('INVITATION')) return '✉️';
    if (type.includes('MEMBER')) return '👥';
    if (type.includes('COMMENT')) return '💬';
    if (type.includes('ATTACHMENT')) return '📎';
    return '📌';
  }

  getActorName(actor: User | string | undefined): string {
    if (!actor) {
      return 'System';
    }

    return typeof actor === 'string' ? actor : actor.username || 'System';
  }

  getTasksForColumn(status: string): Task[] {
    return this.tasks.filter((task) => task.status === status);
  }

  getTaskComments(task: Task): CommentModel[] {
    return (task.comments || []).filter((comment): comment is CommentModel => typeof comment !== 'string') as CommentModel[];
  }

  getTaskAttachments(task: Task): AttachmentModel[] {
    return (task.attachments || []).filter((attachment): attachment is AttachmentModel => typeof attachment !== 'string') as AttachmentModel[];
  }

  selectTask(task: Task): void {
    this.selectedTask = task;
    this.editTaskForm.patchValue({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'TODO',
      priority: task.priority || 'MEDIUM',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignee: typeof task.assignee === 'string' ? task.assignee : task.assignee?.email || '',
      labels: (task.labels || []).join(', ')
    });
  }

  toggleProjectEdit(): void {
    this.editingProject = !this.editingProject;
    if (this.editingProject && this.project) {
      this.projectForm.patchValue({
        name: this.project.name || '',
        description: this.project.description || '',
        visibility: this.project.visibility || 'Private',
        status: this.project.status || 'Active',
        color: this.project.color || ''
      });
    }
  }

  saveProject(): void {
    if (!this.project || this.projectForm.invalid) {
      return;
    }

    this.savingProject = true;
    this.projectsService.updateProject(this.project._id, this.projectForm.value).subscribe({
      next: (updatedProject) => {
        this.savingProject = false;
        this.project = updatedProject;
        this.editingProject = false;
        this.uiService.showToast('Project updated', 'The project details were saved.', 'success');
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.savingProject = false;
        this.error = err.message;
        this.cdr.markForCheck();
      }
    });
  }

  createTask(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (!projectId || this.taskForm.invalid) {
      return;
    }

    const { title, description, status, priority } = this.taskForm.value as { title: string; description?: string; status?: string; priority?: string };
    this.submitting = true;

    this.tasksService.createTask(projectId, { title, description }).pipe(
      switchMap((createdTask) => {
        const payload: Record<string, unknown> = {};
        if (status && status !== 'TODO') {
          payload['status'] = status;
        }
        if (priority) {
          payload['priority'] = priority;
        }

        return Object.keys(payload).length > 0
          ? this.tasksService.updateTask(createdTask._id, payload)
          : of(createdTask);
      })
    ).subscribe({
      next: () => {
        this.submitting = false;
        this.uiService.showToast('Task created', 'The task is ready for your team.', 'success');
        this.taskForm.reset({ title: '', description: '', status: 'TODO', priority: 'MEDIUM' });
        this.load(projectId);
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.submitting = false;
        this.error = err.message;
        this.cdr.markForCheck();
      }
    });
  }

  saveSelectedTask(): void {
    if (!this.selectedTask) {
      return;
    }

    const values = this.editTaskForm.value as { title: string; description: string; status: string; priority: string; dueDate: string; assignee: string; labels: string };
    const payload: Record<string, unknown> = {
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      dueDate: values.dueDate || null
    };

    if (values.assignee) {
      payload['assignee'] = values.assignee;
    }

    if (values.labels) {
      payload['labels'] = values.labels.split(',').map((label) => label.trim()).filter(Boolean);
    }

    this.savingTask = true;
    this.tasksService.updateTask(this.selectedTask._id, payload).subscribe({
      next: () => {
        this.savingTask = false;
        this.uiService.showToast('Task updated', 'The task details were saved.', 'success');
        this.load(this.currentProjectId || this.route.snapshot.paramMap.get('id') || '');
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.savingTask = false;
        this.error = err.message;
        this.cdr.markForCheck();
      }
    });
  }

  postComment(): void {
    if (!this.selectedTask || this.commentForm.invalid) {
      return;
    }

    this.postingComment = true;
    this.tasksService.createComment(this.selectedTask._id, { content: this.commentForm.value.content as string }).subscribe({
      next: () => {
        this.postingComment = false;
        this.commentForm.reset();
        this.refreshSelectedTask();
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.postingComment = false;
        this.error = err.message;
        this.cdr.markForCheck();
      }
    });
  }

  onAttachmentFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.attachmentFile = input.files && input.files.length ? input.files[0] : null;
  }

  uploadAttachment(): void {
    if (!this.selectedTask || !this.attachmentFile) {
      return;
    }

    this.uploadingAttachment = true;
    this.tasksService.uploadAttachment(this.selectedTask._id, this.attachmentFile).subscribe({
      next: () => {
        this.uploadingAttachment = false;
        this.attachmentFile = null;
        this.refreshSelectedTask();
        this.uiService.showToast('Attachment uploaded', 'The file is now attached to the task.', 'success');
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.uploadingAttachment = false;
        this.error = err.message;
        this.cdr.markForCheck();
      }
    });
  }

  deleteAttachment(attachment: AttachmentModel): void {
    if (!this.selectedTask) {
      return;
    }

    this.tasksService.deleteAttachment(this.selectedTask._id, attachment._id).subscribe({
      next: () => {
        this.uiService.showToast('Attachment removed', 'The file was removed from the task.', 'success');
        this.refreshSelectedTask();
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.error = err.message;
        this.cdr.markForCheck();
      }
    });
  }

  sendInvitation(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (!projectId || this.inviteForm.invalid) {
      return;
    }

    this.inviting = true;
    this.invitationsService.sendInvitation(projectId, this.inviteForm.value as { recieverEmail: string }).subscribe({
      next: () => {
        this.inviting = false;
        this.inviteForm.reset();
        this.uiService.showToast('Invitation sent', 'Your collaborator has been invited.', 'success');
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.inviting = false;
        this.error = err.message;
        this.cdr.markForCheck();
      }
    });
  }

  advanceTask(task: Task): void {
    const nextStatus = task.status === 'TODO' ? 'IN_PROGRESS' : task.status === 'IN_PROGRESS' ? 'DONE' : 'TODO';
    this.tasksService.updateTask(task._id, { status: nextStatus }).subscribe({
      next: () => {
        this.uiService.showToast('Task updated', 'The task moved to the next stage.', 'info');
        this.load(this.currentProjectId || this.route.snapshot.paramMap.get('id') || '');
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.error = err.message;
        this.cdr.markForCheck();
      }
    });
  }

  goToTaskPage(page: number): void {
    if (!page || page < 1 || (this.taskMeta && page > this.taskMeta.totalPages)) {
      return;
    }

    this.taskPage = page;
    if (this.currentProjectId) {
      this.load(this.currentProjectId);
    }
  }

  goToActivityPage(page: number): void {
    if (!page || page < 1 || (this.activityMeta && page > this.activityMeta.totalPages)) {
      return;
    }

    this.activityPage = page;
    if (this.currentProjectId) {
      this.load(this.currentProjectId);
    }
  }

  private refreshSelectedTask(): void {
    if (!this.selectedTask) {
      return;
    }

    this.tasksService.getTask(this.selectedTask._id).subscribe({
      next: (task) => {
        this.selectedTask = task;
        this.selectTask(task);
        this.tasks = this.tasks.map((entry) => entry._id === task._id ? task : entry);
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.error = err.message;
        this.cdr.markForCheck();
      }
    });
  }

  private load(projectId: string): void {
    this.currentProjectId = projectId;
    this.loading = true;
    this.error = '';

    forkJoin({
      project: this.projectsService.getProject(projectId),
      members: this.projectsService.getMembers(projectId),
      tasks: this.tasksService.getTasksByProject(projectId, this.taskPage, this.taskPageSize),
      activity: this.projectsService.getActivity(projectId, this.activityPage, this.activityPageSize)
    }).subscribe({
      next: ({ project, members, tasks, activity }) => {
        this.project = project;
        this.members = members;
        this.tasks = tasks.data;
        this.taskMeta = tasks.meta;
        this.taskSummary = tasks.summary;
        this.activity = activity.data;
        this.activityMeta = activity.meta;
        this.activitySummary = activity.summary;
        this.loading = false;
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
