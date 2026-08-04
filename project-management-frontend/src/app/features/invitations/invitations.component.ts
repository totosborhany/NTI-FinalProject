import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvitationsService } from '../../core/invitations.service';
import { AuthService } from '../../core/auth.service';
import { Invitation } from '../../core/models';
import { UiService } from '../../core/ui.service';

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header Banner -->
      <div class="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-indigo-400">Invitations</p>
        <h1 class="mt-1 text-2xl font-bold tracking-tight">Coordinate collaborators effortlessly</h1>
        <p class="mt-1 text-sm text-slate-400">Review incoming requests and keep your project access clear and intentional.</p>
      </div>

      <!-- Loading State -->
      @if (loading) {
        <div class="space-y-3">
          @for (i of [1,2]; track i) {
            <div class="h-20 animate-pulse rounded-2xl bg-slate-100"></div>
          }
        </div>
      }

      <!-- Error State -->
      @if (error) {
        <div class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          {{ error }}
        </div>
      }

      <!-- Content Grid -->
      @if (!loading) {
        <div class="grid gap-6 lg:grid-cols-2">
          
          <!-- Received Invitations -->
          <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-base font-bold text-slate-900">Received</h2>
                <p class="text-xs text-slate-500">Invites waiting for your response.</p>
              </div>
              <span class="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                {{ received.length }}
              </span>
            </div>

            @if (received.length === 0) {
              <div class="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
                No invitations received yet.
              </div>
            } @else {
              <div class="mt-4 space-y-3">
                @for (invitation of received; track invitation._id) {
                  <div class="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <p class="text-sm font-semibold text-slate-900">{{ getProjectName(invitation) }}</p>
                        <p class="mt-0.5 text-xs text-slate-500">
                          From: {{ getParticipantName(invitation, 'sender') }}
                        </p>
                      </div>

                      <!-- Dynamic Status Badge -->
                      <span [ngClass]="{
                        'bg-amber-100 text-amber-800': invitation.status === 'Pending',
                        'bg-emerald-100 text-emerald-800': invitation.status === 'Accepted',
                        'bg-rose-100 text-rose-800': invitation.status === 'Rejected'
                      }" class="rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                        {{ invitation.status }}
                      </span>
                    </div>

                    <!-- Action Buttons: ONLY render when Pending -->
                    @if (invitation.status === 'Pending') {
                      <div class="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                        <button 
                          (click)="respond(invitation, 'Accepted')" 
                          class="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700">
                          Accept
                        </button>
                        <button 
                          (click)="respond(invitation, 'Rejected')" 
                          class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200">
                          Reject
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </section>

          <!-- Sent Invitations -->
          <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-base font-bold text-slate-900">Sent</h2>
                <p class="text-xs text-slate-500">The invites you have shared.</p>
              </div>
              <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                {{ sent.length }}
              </span>
            </div>

            @if (sent.length === 0) {
              <div class="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
                No invitations sent yet.
              </div>
            } @else {
              <div class="mt-4 space-y-3">
                @for (invitation of sent; track invitation._id) {
                  <div class="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <p class="text-sm font-semibold text-slate-900">{{ getProjectName(invitation) }}</p>
                        <p class="mt-0.5 text-xs text-slate-500">
                          To: {{ getParticipantName(invitation, 'receiver') }}
                        </p>
                      </div>

                      <!-- Dynamic Status Badge -->
                      <span [ngClass]="{
                        'bg-amber-100 text-amber-800': invitation.status === 'Pending',
                        'bg-emerald-100 text-emerald-800': invitation.status === 'Accepted',
                        'bg-rose-100 text-rose-800': invitation.status === 'Rejected'
                      }" class="rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                        {{ invitation.status }}
                      </span>
                    </div>
                  </div>
                }
              </div>
            }
          </section>

        </div>
      }
    </div>
  `
})
export class InvitationsComponent implements OnInit {
  private readonly invitationsService = inject(InvitationsService);
  private readonly authService = inject(AuthService);
  private readonly uiService = inject(UiService);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = true;
  error = '';
  received: Invitation[] = [];
  sent: Invitation[] = [];

  ngOnInit(): void {
    this.load();
  }

  getProjectName(invitation: Invitation): string {
    return typeof invitation.project === 'string' 
      ? invitation.project 
      : invitation.project?.name || 'Project';
  }

  getParticipantName(invitation: Invitation, role: 'sender' | 'receiver'): string {
    const participant = (invitation as any)[role];
    if (!participant) return 'Unknown';
    if (typeof participant === 'string') return participant;
    return participant.username || participant.email || 'User';
  }

  respond(invitation: Invitation, status: 'Accepted' | 'Rejected'): void {
    this.invitationsService.respondToInvitation(invitation._id, status).subscribe({
      next: () => {
        this.uiService.showToast('Invitation updated', `The invitation was ${status.toLowerCase()}.`, 'success');
        this.load();
      },
      error: (err: Error) => {
        this.error = err.message;
        this.cdr.markForCheck();
      }
    });
  }

  private load(): void {
    this.loading = true;
    this.error = '';
    this.invitationsService.getInvitations().subscribe({
      next: (invitations) => {
        const me = this.authService.currentUser();
        const myId = me?._id;

        this.received = invitations.filter((inv) => {
          const receiver = (inv as any).receiver;
          if (!receiver) return false;
          const rId = typeof receiver === 'string' ? receiver : receiver._id;
          return rId === myId;
        });

        this.sent = invitations.filter((inv) => {
          const sender = (inv as any).sender;
          if (!sender) return false;
          const sId = typeof sender === 'string' ? sender : sender._id;
          return sId === myId;
        });

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