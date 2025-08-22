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

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  Signal,
  WritableSignal,
} from "@angular/core";
import { MatButton } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { TranslocoDirective } from "@jsverse/transloco";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatOption } from "@angular/material/core";
import { MatFormField, MatLabel, MatSelect } from "@angular/material/select";
import { MatIcon } from "@angular/material/icon";
import {
  WorkspaceMembership,
  WorkspaceMembershipDeleteInfo,
  WorkspaceMembershipRepositoryService,
} from "@tenzu/repository/workspace-membership";
import { WorkspaceRepositoryService } from "@tenzu/repository/workspace";
import { UserStore } from "@tenzu/repository/user";
import { LowerCasePipe } from "@angular/common";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

type DeleteMembershipDialogData = {
  membership: Signal<WorkspaceMembership>;
};

@Component({
  selector: "app-delete-workspace-membership-dialog",
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    TranslocoDirective,
    ReactiveFormsModule,
    MatOption,
    MatSelect,
    MatIcon,
    MatLabel,
    MatFormField,
    LowerCasePipe,
    MatProgressSpinner,
  ],
  template: `
    <ng-container *transloco="let t">
      @let _isSelf = isSelf();
      @let membership = data.membership();
      @let _deleteInfo = deleteInfo();
      @let _userRole = userRole();
      @let _isLastMembership = isLastMembership();
      @if (_deleteInfo) {
        <h2 id="aria-label" mat-dialog-title>
          @if (_isSelf) {
            {{ t("workspace.members.delete.leave_title", { name: workspaceRepositoryService.entityDetail()?.name }) }}
          } @else {
            {{
              t("component.membership.confirm_remove_message", {
                member: membership.user.fullName,
                item: t("commons.workspace") | lowercase,
                name: workspaceRepositoryService.entityDetail()?.name,
              })
            }}
          }
        </h2>
        <mat-dialog-content>
          @if (_isSelf) {
            @if (membership.totalProjectsIsMember) {
              <h3 class="mat-title-small mb-2 flex flex-row items-center">
                <mat-icon class="text-on-error mr-3">warning</mat-icon>
                <p class="text-on-error">
                  {{
                    t("workspace.members.delete.forbidden_existing_projects_self", {
                      names: _deleteInfo.memberOfProjects,
                    })
                  }}
                </p>
              </h3>
            } @else {
              @if (_isLastMembership) {
                <h3 class="mat-title-small mb-2 flex flex-row items-center">
                  <mat-icon class="text-on-error mr-3">warning</mat-icon>
                  <p class="text-on-error">{{ t("workspace.members.delete.workspace_will_be_deleted") }}</p>
                </h3>
              } @else if (_deleteInfo.isUniqueOwner) {
                <h3 class="mat-title-small mb-2 flex flex-row items-center">
                  <mat-icon class="text-on-error mr-3">warning</mat-icon>
                  <p class="text-on-error">{{ t("workspace.members.delete.sole_owner_succession") }}</p>
                </h3>
                <form class="flex flex-col gap-y-4" [formGroup]="form">
                  <mat-form-field>
                    <mat-label>{{ t("workspace.members.delete.successor_label") }}</mat-label>
                    <mat-select formControlName="successorId">
                      @for (ms of filteredMemberships(); track ms.id) {
                        <mat-option value="{{ ms.user.id }}">
                          {{ ms.user.fullName }}
                        </mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                </form>
              }
            }
          } @else {
            @if (_deleteInfo.uniqueOwnerOfProjects.length > 0) {
              @if (_userRole?.isOwner) {
                <h3 class="mat-title-small mb-2 flex flex-row items-center">
                  <mat-icon class="text-on-error mr-3">warning</mat-icon>
                  <p class="text-on-error">
                    {{
                      t("workspace.members.delete.existing_projects_succession_warning", {
                        names: _deleteInfo.uniqueOwnerOfProjects,
                      })
                    }}
                  </p>
                </h3>
              } @else {
                <h3 class="mat-title-small mb-2 flex flex-row items-center">
                  <mat-icon class="text-on-error mr-3">warning</mat-icon>
                  <p class="text-on-error">
                    {{
                      t("workspace.members.delete.forbidden_existing_projects_other", {
                        names: _deleteInfo.uniqueOwnerOfProjects,
                      })
                    }}
                  </p>
                </h3>
              }
            }
          }
        </mat-dialog-content>
        @let forbidden =
          (_isSelf && membership.totalProjectsIsMember) ||
          (!_isSelf && _deleteInfo.uniqueOwnerOfProjects.length > 0 && !_userRole?.isOwner);
        <mat-dialog-actions [align]="forbidden ? 'center' : 'end'">
          @if (forbidden) {
            <button matButton="outlined" mat-dialog-close class="primary-button">
              {{ t("workspace.members.delete.forbidden_confirm") }}
            </button>
          } @else {
            <button mat-flat-button mat-dialog-close class="secondary-button">
              {{ t("directives.confirm_popup_component.cancelAction") }}
            </button>
            <button
              mat-flat-button
              (click)="submit()"
              class="error-button"
              [disabled]="_isSelf && !_isLastMembership && _deleteInfo.isUniqueOwner && form.invalid"
            >
              {{ t("directives.confirm_popup_component.confirmAction") }}
            </button>
          }
        </mat-dialog-actions>
      } @else {
        <mat-dialog-content>
          <mat-spinner></mat-spinner>
        </mat-dialog-content>
      }
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteWorkspaceMembershipDialogComponent {
  data = inject<DeleteMembershipDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<DeleteWorkspaceMembershipDialogComponent>);
  fb = inject(FormBuilder);
  readonly userStore = inject(UserStore);
  readonly workspaceMembershipService = inject(WorkspaceMembershipRepositoryService);
  readonly workspaceRepositoryService = inject(WorkspaceRepositoryService);

  userRole = computed(() => this.workspaceRepositoryService.entityDetail()?.userRole);
  isSelf = computed(() => this.userStore.myUser().id == this.data.membership().user.id);

  form = this.fb.group({
    successorId: [undefined, Validators.required],
  });

  deleteInfo: WritableSignal<WorkspaceMembershipDeleteInfo | undefined> = signal(undefined);

  filteredMemberships = computed(() => {
    return this.workspaceMembershipService
      .entities()
      .filter((membership) => membership.id !== this.data.membership().id);
  });
  isLastMembership = computed(() => {
    return this.filteredMemberships().length === 0;
  });

  submit() {
    this.dialogRef.close({ ...this.form.value, membership: this.data.membership(), delete: this.isLastMembership() });
  }

  constructor() {
    effect(async () => {
      const membership = this.data.membership();
      this.deleteInfo.set(await this.workspaceMembershipService.getDeleteInfoRequest(membership));
    });
  }
}
