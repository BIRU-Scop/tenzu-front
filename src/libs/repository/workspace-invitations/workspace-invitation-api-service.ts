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
import {
  CreateWorkspaceInvitationRequest,
  CreateWorkspaceInvitationResponse,
  WorkspaceInvitation,
} from "./workspace-invitation.model";
import { Observable } from "rxjs";
import { Workspace } from "../workspace";

type ListParams = {
  workspaceId: Workspace["id"];
};

@Injectable({
  providedIn: "root",
})
export class WorkspaceInvitationsApiService extends AbstractApiService<
  WorkspaceInvitation,
  WorkspaceInvitation,
  ListParams
> {
  protected override baseUrl = `${this.configAppService.apiUrl()}workspaces`;
  protected override getBaseUrl(params: { workspaceId: Workspace["id"] }) {
    return `${this.baseUrl}/${params.workspaceId}/invitations`;
  }
  protected override getEntityBaseUrl(): string {
    throw new Error("Method not implemented.");
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

  override delete(): Observable<void> {
    throw new Error("Method not implemented.");
  }
  createBulkInvitations(data: CreateWorkspaceInvitationRequest, params: { workspaceId: Workspace["id"] }) {
    return this.http.post<CreateWorkspaceInvitationResponse>(`${this.getBaseUrl(params)}`, data);
  }
  getByToken(params: { token: string }) {
    return this.http.get<WorkspaceInvitation>(`${this.baseUrl}/invitations/${params.token}`);
  }

  acceptByToken(params: { token: string }) {
    return this.http.post<WorkspaceInvitation>(`${this.baseUrl}/invitations/${params.token}/accept`, params.token);
  }
}
