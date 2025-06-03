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
import { WorkspaceMembershipDetail } from "./workspace-membership.model";
import { Observable } from "rxjs";

type ListWorkspaceMembershipParams = {
  workspaceId: WorkspaceSummary["id"];
};
type CreateWorkspaceMembershipParams = unknown;
type GetWorkspaceMembershipParams = unknown;
type PutWorkspaceMembershipParams = unknown;
type PatchWorkspaceMembershipParams = { membershipId: WorkspaceMembershipDetail["id"] };
type DeleteWorkspaceMembershipParams = { membershipId: WorkspaceMembershipDetail["id"] };

@Injectable({
  providedIn: "root",
})
export class WorkspaceMembershipApiService extends AbstractApiService<
  WorkspaceMembershipDetail,
  WorkspaceMembershipDetail,
  ListWorkspaceMembershipParams,
  GetWorkspaceMembershipParams,
  CreateWorkspaceMembershipParams,
  PutWorkspaceMembershipParams,
  PatchWorkspaceMembershipParams,
  DeleteWorkspaceMembershipParams
> {
  protected override baseUrl = `${this.configAppService.apiUrl()}workspaces`;
  protected override getBaseUrl(params: { workspaceId: WorkspaceSummary["id"] }) {
    return `${this.baseUrl}/${params.workspaceId}/memberships`;
  }
  protected override getEntityBaseUrl(params: { membershipId: WorkspaceMembershipDetail["id"] }): string {
    return `${this.baseUrl}/memberships/${params.membershipId}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override create(item: Partial<WorkspaceMembershipDetail>): Observable<WorkspaceMembershipDetail> {
    throw new Error("Method not implemented.");
  }
  override get(): Observable<WorkspaceMembershipDetail> {
    throw new Error("Method not implemented.");
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override put(item: Partial<WorkspaceMembershipDetail>): Observable<WorkspaceMembershipDetail> {
    throw new Error("Method not implemented.");
  }
}
