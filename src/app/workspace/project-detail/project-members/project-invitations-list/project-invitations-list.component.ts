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

import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import { ProjectDetail, ProjectRepositoryService } from "@tenzu/repository/project";
import { animate, query, stagger, style, transition, trigger } from "@angular/animations";
import { ProjectInvitation, ProjectInvitationRepositoryService } from "@tenzu/repository/project-invitations";
import { PermissionOrRedirectDirective } from "@tenzu/directives/permission.directive";
import { ProjectPermissions } from "@tenzu/repository/permission/permission.model";
import { InvitationStatusComponent } from "@tenzu/shared/components/invitations/invitation-status.component";
import { InvitationActionsComponent } from "@tenzu/shared/components/invitations/invitation-actions.component";
import { InvitationRoleComponent } from "@tenzu/shared/components/invitations/invitation-role.component";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-project-invitations-list",
  imports: [
    TranslocoDirective,
    InvitationStatusComponent,
    InvitationActionsComponent,
    InvitationRoleComponent,
    PermissionOrRedirectDirective,
  ],
  template: `
    @let project = projectRepositoryService.entityDetail();
    @if (project) {
      <ng-container *transloco="let t">
        <ng-container
          [appPermissionOrRedirect]="{
            expectedId: project.id,
            requiredPermission: ProjectPermissions.CREATE_MODIFY_MEMBER,
            type: 'project',
            redirectUrl: ['..'],
            redirectUrlExtras: { relativeTo: activatedRoute },
          }"
        >
          @let projectInvitations = projectInvitationRepositoryService.entities();
          @if (projectInvitations.length > 0) {
            <div class="app-table" [@newItemsFlyIn]="projectInvitations.length">
              <div class="app-table-row-group">
                @for (invitation of projectInvitations; track invitation.id) {
                  <div class="app-table-row">
                    <div class="app-table-cell basis-1/3">{{ invitation.email }}</div>
                    <div class="app-table-cell basis-1/3">
                      <app-invitation-role [invitation]="invitation" itemType="project" [userRole]="project.userRole" />
                    </div>
                    <div class="app-table-cell basis-full">
                      <app-invitation-status [invitation]="invitation" />
                    </div>
                    <div class="app-table-cell basis-1/2">
                      <app-invitation-actions
                        [invitation]="invitation"
                        [item]="project"
                        itemType="project"
                        [resentInvitation]="resentInvitationId() === invitation.id"
                        (resend)="resendInvitation($event)"
                        (revoke)="projectInvitationRepositoryService.revokeProjectInvitation($event)"
                      />
                    </div>
                  </div>
                }
              </div>
            </div>
          } @else {
            <p class="mat-body-medium text-on-surface-variant mt-4">{{ t("project.members.invitation_empty") }}</p>
          }
        </ng-container>
      </ng-container>
    }
  `,
  animations: [
    trigger("newItemsFlyIn", [
      transition(":enter, * => 0, * => -1", []),
      transition(":increment", [
        query(
          ":enter",
          [
            style({ opacity: 0, height: 0 }),
            stagger(50, [animate("200ms ease-out", style({ opacity: 1, height: "*" }))]),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProjectMembersComponent {
  projectId = input.required<ProjectDetail["id"]>();

  protected readonly ProjectPermissions = ProjectPermissions;

  readonly projectRepositoryService = inject(ProjectRepositoryService);
  readonly projectInvitationRepositoryService = inject(ProjectInvitationRepositoryService);
  readonly activatedRoute = inject(ActivatedRoute);

  resentInvitationId = signal<ProjectInvitation["id"] | null>(null);

  constructor() {
    effect(() => {
      this.projectInvitationRepositoryService.listProjectInvitations(this.projectId()).then();
    });
  }

  resendInvitation(invitationId: ProjectInvitation["id"]) {
    this.projectInvitationRepositoryService.resendProjectInvitation(invitationId);
    this.resentInvitationId.set(invitationId);
  }
}
