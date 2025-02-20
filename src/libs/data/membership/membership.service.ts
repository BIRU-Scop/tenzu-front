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

import { inject, Injectable, signal } from "@angular/core";
import { ProjectMembership } from "@tenzu/data/membership/membership.model";
import { MembershipInfraService } from "@tenzu/data/membership/membership-infra.service";
import { MembershipStore } from "@tenzu/data/membership/membership.store";
import { lastValueFrom } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class MembershipService {
  private membershipInfraService = inject(MembershipInfraService);
  private membershipCollectionStore = inject(MembershipStore);
  projectMembershipEntities = this.membershipCollectionStore.projectEntities;
  workspaceMembershipEntities = this.membershipCollectionStore.workspaceEntities;
  guestMembershipEntities = this.membershipCollectionStore.workspaceGuestsEntities;
  projectInvitationsEntities = this.membershipCollectionStore.projectInvitationsEntities;
  workspaceInvitationsEntities = this.membershipCollectionStore.workspaceInvitationsEntities;

  isLoading = signal(false);

  async listProjectMembership(projectId: string) {
    this.isLoading.set(true);
    const projectMemberships = await lastValueFrom(this.membershipInfraService.listProjectMembership(projectId));
    this.isLoading.set(false);
    this.membershipCollectionStore.listProjectMembership(projectMemberships);
  }

  async patchProjectMembership(projectId: string, username: string, value: Partial<ProjectMembership>) {
    this.isLoading.set(true);
    const projectMembership = await lastValueFrom(
      this.membershipInfraService.patchProjectMembership(projectId, username, value),
    );
    this.isLoading.set(false);
    this.membershipCollectionStore.patchProjectMembership(projectMembership);
  }

  async deleteProjectMembership(projectId: string, username: string) {
    this.isLoading.set(true);
    await lastValueFrom(this.membershipInfraService.deleteProjectMembership(projectId, username));
    this.isLoading.set(false);
    this.membershipCollectionStore.deleteProjectMembership(username);
  }

  async listWorkspaceMembership(workspaceId: string) {
    this.isLoading.set(true);
    const workspaceMemberships = await lastValueFrom(this.membershipInfraService.listWorkspaceMembership(workspaceId));
    this.isLoading.set(false);
    this.membershipCollectionStore.listWorkspaceMembership(workspaceMemberships);
  }

  async listWorkspaceGuest(workspaceId: string) {
    this.isLoading.set(true);
    const workspaceGuests = await lastValueFrom(this.membershipInfraService.listWorkspaceGuest(workspaceId));
    this.isLoading.set(false);
    this.membershipCollectionStore.listWorkspaceGuest(workspaceGuests);
  }

  async listWorkspaceInvitations(workspaceId: string) {
    this.isLoading.set(true);
    const workspaceInvitations = await lastValueFrom(this.membershipInfraService.listWorkspaceInvitations(workspaceId));
    this.isLoading.set(false);
    this.membershipCollectionStore.listWorkspaceInvitations(workspaceInvitations);
  }

  async listProjectInvitations(projectId: string) {
    this.isLoading.set(true);
    const projectInvitations = await lastValueFrom(this.membershipInfraService.listProjectInvitations(projectId));
    this.isLoading.set(false);
    this.membershipCollectionStore.listProjectInvitations(projectInvitations);
  }

  async deleteWorkspaceMembership(workspaceId: string, username: string) {
    this.isLoading.set(true);
    await lastValueFrom(this.membershipInfraService.deleteWorkspaceMembership(workspaceId, username));
    this.isLoading.set(false);
    this.membershipCollectionStore.deleteWorkspaceMembership(username);
  }

  async sendWorkspaceInvitations(workspaceId: string, invitationMail: string[]) {
    await lastValueFrom(this.membershipInfraService.sendWorkspaceInvitations(workspaceId, invitationMail));
  }

  async sendProjectInvitations(id: string, mails: string[]) {
    await lastValueFrom(this.membershipInfraService.sendProjectInvitations(id, mails));
  }
}
