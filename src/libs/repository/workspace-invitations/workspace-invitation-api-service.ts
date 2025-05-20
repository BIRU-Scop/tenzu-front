/*
 * Copyright (C) 2024-2025 BIRU
 *
 * This file is part of Tenzu.
 *
 * Tenzu is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * You can contact BIRU at ask@biru.sh
 *
 */

import { Injectable } from "@angular/core";
import { AbstractApiService } from "../base";
import { PublicWorkspacePendingInvitation, WorkspaceInvitation } from "./workspace-invitation.model";
import { Observable } from "rxjs";
import { WorkspaceSummary } from "../workspace";
import { CreateInvitations, InvitationsPayload } from "../membership";

type ListWorkspaceInvitationParams = {
  workspaceId: WorkspaceSummary["id"];
};
type PatchWorkspaceInvitationParams = { invitationId: WorkspaceInvitation["id"] };

@Injectable({
  providedIn: "root",
})
export class WorkspaceInvitationsApiService extends AbstractApiService<
  WorkspaceInvitation,
  WorkspaceInvitation,
  ListWorkspaceInvitationParams,
  unknown,
  unknown,
  unknown,
  PatchWorkspaceInvitationParams,
  unknown
> {
  protected override baseUrl = `${this.configAppService.apiUrl()}workspaces`;
  protected override getBaseUrl(params: { workspaceId: WorkspaceSummary["id"] }) {
    return `${this.baseUrl}/${params.workspaceId}/invitations`;
  }
  protected override getEntityBaseUrl(params: { invitationId: WorkspaceInvitation["id"] }) {
    return `${this.baseUrl}/invitations/${params.invitationId}`;
  }

  override create(): Observable<WorkspaceInvitation> {
    throw new Error("Method not implemented.");
  }
  override get(): Observable<WorkspaceInvitation> {
    throw new Error("Method not implemented.");
  }

  override put(): Observable<WorkspaceInvitation> {
    throw new Error("Method not implemented.");
  }

  resend(params: PatchWorkspaceInvitationParams): Observable<WorkspaceInvitation> {
    return this.http.post<WorkspaceInvitation>(`${this.patchUrl(params)}/resend`, {});
  }

  revoke(params: PatchWorkspaceInvitationParams): Observable<WorkspaceInvitation> {
    return this.http.post<WorkspaceInvitation>(`${this.patchUrl(params)}/revoke`, {});
  }

  override delete(): Observable<void> {
    throw new Error("Method not implemented.");
  }
  createBulkInvitations(data: InvitationsPayload, params: { workspaceId: WorkspaceSummary["id"] }) {
    return this.http.post<CreateInvitations>(`${this.getBaseUrl(params)}`, data);
  }
  getByToken(params: { token: string }) {
    return this.http.get<PublicWorkspacePendingInvitation>(`${this.baseUrl}/invitations/by_token/${params.token}`);
  }

  acceptForCurrentUser(params: { workspaceId: WorkspaceSummary["id"] }) {
    return this.http.post<WorkspaceInvitation>(`${this.getBaseUrl(params)}/accept`, null);
  }

  acceptByToken(params: { token: string }) {
    return this.http.post<WorkspaceInvitation>(
      `${this.baseUrl}/invitations/by_token/${params.token}/accept`,
      params.token,
    );
  }
}
