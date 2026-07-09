/*
 * Copyright (C) 2024-2026 BIRU
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
import { AbstractApiService } from "../base/abstract-api-services";
import { parseWithDebug } from "../base/schema-utils";
import { ProjectDetail, ProjectSummary } from "../project/project.model";
import {
  ProjectInvitation,
  projectInvitationSchema,
  PublicProjectPendingInvitation,
  publicProjectPendingInvitationSchema,
} from "./project-invitation.model";
import { Observable } from "rxjs";
import { CreateInvitations, createInvitationsSchema, InvitationsPayload } from "../membership/invitation.model";
import { BaseDataModel } from "../base/misc.model";
import { map } from "rxjs/operators";

type ListProjectInvitationParams = {
  projectId: ProjectSummary["id"];
};
type PatchProjectInvitationParams = { invitationId: ProjectInvitation["id"] };

@Injectable({
  providedIn: "root",
})
export class ProjectInvitationsApiService extends AbstractApiService<
  ProjectInvitation,
  ProjectInvitation,
  ListProjectInvitationParams,
  unknown,
  unknown,
  unknown,
  PatchProjectInvitationParams,
  unknown
> {
  protected override baseUrl = `${this.configAppService.apiUrl()}/projects`;
  protected override summarySchema = projectInvitationSchema;
  protected override detailSchema = projectInvitationSchema;
  protected override getBaseUrl(params: { projectId: ProjectDetail["id"] }) {
    return `${this.baseUrl}/${params.projectId}/invitations`;
  }
  protected override getEntityBaseUrl(params: { invitationId: ProjectInvitation["id"] }) {
    return `${this.baseUrl}/invitations/${params.invitationId}`;
  }

  override create(): Observable<ProjectInvitation> {
    throw new Error("Method not implemented.");
  }
  override get(): Observable<ProjectInvitation> {
    throw new Error("Method not implemented.");
  }

  override put(): Observable<ProjectInvitation> {
    throw new Error("Method not implemented.");
  }

  resend(params: PatchProjectInvitationParams): Observable<ProjectInvitation> {
    return this.http
      .post<BaseDataModel<unknown>>(`${this.patchUrl(params)}/resend`, {})
      .pipe(map((dataObject) => parseWithDebug(projectInvitationSchema, dataObject.data)));
  }

  revoke(params: PatchProjectInvitationParams): Observable<ProjectInvitation> {
    return this.http
      .post<BaseDataModel<unknown>>(`${this.patchUrl(params)}/revoke`, {})
      .pipe(map((dataObject) => parseWithDebug(projectInvitationSchema, dataObject.data)));
  }

  override delete(): Observable<void> {
    throw new Error("Method not implemented.");
  }
  createBulkInvitations(
    data: InvitationsPayload,
    params: { projectId: ProjectDetail["id"] },
  ): Observable<CreateInvitations> {
    return this.http
      .post<unknown>(`${this.getBaseUrl(params)}`, data)
      .pipe(map((response) => parseWithDebug(createInvitationsSchema, response)));
  }
  getByToken(params: { token: string }): Observable<PublicProjectPendingInvitation> {
    return this.http
      .get<BaseDataModel<unknown>>(`${this.baseUrl}/invitations/by_token/${params.token}`)
      .pipe(map((dataObject) => parseWithDebug(publicProjectPendingInvitationSchema, dataObject.data)));
  }

  acceptByToken(params: { token: string }): Observable<ProjectInvitation> {
    return this.http
      .post<BaseDataModel<unknown>>(`${this.baseUrl}/invitations/by_token/${params.token}/accept`, params.token)
      .pipe(map((dataObject) => parseWithDebug(projectInvitationSchema, dataObject.data)));
  }

  acceptForCurrentUser(params: { projectId: ProjectDetail["id"] }): Observable<ProjectInvitation> {
    return this.http
      .post<BaseDataModel<unknown>>(`${this.getBaseUrl(params)}/accept`, null)
      .pipe(map((dataObject) => parseWithDebug(projectInvitationSchema, dataObject.data)));
  }

  denyForCurrentUser(params: { projectId: ProjectDetail["id"] }): Observable<ProjectInvitation> {
    return this.http
      .post<BaseDataModel<unknown>>(`${this.getBaseUrl(params)}/deny`, null)
      .pipe(map((dataObject) => parseWithDebug(projectInvitationSchema, dataObject.data)));
  }
}
