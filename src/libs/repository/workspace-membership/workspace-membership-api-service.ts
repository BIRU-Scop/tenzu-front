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
import { WorkspaceSummary } from "../workspace";
import { WorkspaceMembership, WorkspaceMembershipDeleteInfo } from "./workspace-membership.model";
import { Observable } from "rxjs";

type ListWorkspaceMembershipParams = {
  workspaceId: WorkspaceSummary["id"];
};
type CreateWorkspaceMembershipParams = unknown;
type GetWorkspaceMembershipParams = unknown;
type PutWorkspaceMembershipParams = unknown;
type PatchWorkspaceMembershipParams = { membershipId: WorkspaceMembership["id"] };
type DeleteWorkspaceMembershipParams = { membershipId: WorkspaceMembership["id"] };

@Injectable({
  providedIn: "root",
})
export class WorkspaceMembershipApiService extends AbstractApiService<
  WorkspaceMembership,
  WorkspaceMembership,
  ListWorkspaceMembershipParams,
  GetWorkspaceMembershipParams,
  CreateWorkspaceMembershipParams,
  PutWorkspaceMembershipParams,
  PatchWorkspaceMembershipParams,
  DeleteWorkspaceMembershipParams
> {
  protected override baseUrl = `${this.configAppService.apiUrl()}/workspaces`;
  protected override getBaseUrl(params: { workspaceId: WorkspaceSummary["id"] }) {
    return `${this.baseUrl}/${params.workspaceId}/memberships`;
  }
  protected override getEntityBaseUrl(params: { membershipId: WorkspaceMembership["id"] }): string {
    return `${this.baseUrl}/memberships/${params.membershipId}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override create(item: Partial<WorkspaceMembership>): Observable<WorkspaceMembership> {
    throw new Error("Method not implemented.");
  }
  override get(): Observable<WorkspaceMembership> {
    throw new Error("Method not implemented.");
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override put(item: Partial<WorkspaceMembership>): Observable<WorkspaceMembership> {
    throw new Error("Method not implemented.");
  }

  getDeleteInfo(item: WorkspaceMembership) {
    return this.http.get<WorkspaceMembershipDeleteInfo>(
      `${this.getEntityBaseUrl({ membershipId: item.id })}/delete-info`,
    );
  }
}
