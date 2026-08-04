import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Invitation } from './models';

@Injectable({ providedIn: 'root' })
export class InvitationsService {
  private readonly api = inject(ApiService);

  getInvitations(): Observable<Invitation[]> {
    return this.api.get<Invitation[]>('/invitations/');
  }

  sendInvitation(projectId: string, payload: { recieverEmail: string }): Observable<Invitation> {
    return this.api.post<Invitation>(`/invitations/${projectId}`, payload);
  }

  respondToInvitation(invitationId: string, status: 'Accepted' | 'Rejected'): Observable<Invitation> {
    return this.api.patch<Invitation>(`/invitations/${invitationId}`, { status });
  }

  deleteInvitation(projectId: string, invitationId: string): Observable<unknown> {
    return this.api.delete(`/invitations/${projectId}/${invitationId}`);
  }
}
