/*
 * Copyright (C) 2025-2026 BIRU
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

import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core";
import { ProjectRoleSummary } from "@tenzu/repository/project-roles";
import { Role } from "@tenzu/repository/membership";
import { TranslocoDirective } from "@jsverse/transloco";
import { ProjectPermissions } from "@tenzu/repository/permission/permission.model";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { toObservable } from "@angular/core/rxjs-interop";
import { filterNotNull } from "@tenzu/utils/functions/rxjs.operators";
import { PermissionOrRedirectDirective } from "@tenzu/directives/permission.directive";
import { FormValue, RoleFacade } from "../role.facade";
import { FormRoleComponent } from "../form-role/form-role.component";
import { NotificationService } from "@tenzu/utils/services/notification";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { DeleteWarningButtonComponent } from "@tenzu/shared/components/delete-warning-button/delete-warning-button.component";
import { ProjectDetail } from "@tenzu/repository/project";
import { ButtonSaveComponent } from "@tenzu/shared/components/ui/button/button-save.component";
import { FormFooterComponent } from "@tenzu/shared/components/ui/form-footer/form-footer.component";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "app-edit-role",
  imports: [
    TranslocoDirective,
    ReactiveFormsModule,
    MatButton,
    FormRoleComponent,
    PermissionOrRedirectDirective,
    RouterLink,
    DeleteWarningButtonComponent,
    ButtonSaveComponent,
    FormFooterComponent,
    MatIcon,
  ],
  template: `
    @let _currentRole = currentRole();
    @let projectDetail = currentProjectDetail();
    @if (_currentRole && projectDetail) {
      <div class="flex flex-col gap-y-8" *transloco="let t">
        <ng-container
          [appPermissionOrRedirect]="{
            requiredPermission: ProjectPermissions.CREATE_MODIFY_DELETE_ROLE,
            expectedId: projectDetail.id,
            type: 'project',
          }"
        >
          <form
            class="flex flex-col gap-y-2"
            [formGroup]="form"
            (submit)="onSave({ values: form.getRawValue(), currentRole: _currentRole })"
          >
            <app-form-role [form]="form" />
            @if (_currentRole.editable) {
              <app-form-footer class="!justify-start">
                <a appFormFooterSecondaryAction mat-flat-button routerLink="../../list-roles" class="secondary-button">
                  <mat-icon>cancel</mat-icon> {{ t("commons.cancel") }}
                </a>
                <app-button-save translocoKey="project.buttons.save" [disabled]="form.pristine || form.invalid" />
              </app-form-footer>
            } @else {
              <a mat-flat-button routerLink="../../list-roles" class="secondary-button w-min">
                <mat-icon>close</mat-icon> {{ t("commons.close") }}
              </a>
            }
          </form>
          @if (_currentRole.editable) {
            <app-delete-warning-button
              [translocoKeyTitle]="'project.settings.permissions.delete_role_title'"
              [translocoKeyWarningMessage]="'project.settings.permissions.delete_role_warning'"
              (popupConfirm)="deleteRole(_currentRole, projectDetail)"
            ></app-delete-warning-button>
          }
        </ng-container>
      </div>
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditRoleComponent {
  readonly roleId = input.required<Role["id"]>();
  readonly roleFacade = inject(RoleFacade);
  readonly notificationService = inject(NotificationService);
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly currentRole = this.roleFacade.currentRole;
  readonly currentProjectDetail = this.roleFacade.currentProjectDetail;
  form = this.roleFacade.buildForm();
  readonly ProjectPermissions = ProjectPermissions;

  constructor() {
    toObservable(this.currentRole)
      .pipe(filterNotNull())
      .subscribe((role) => {
        this.roleFacade.initForm({ form: this.form, role });
      });
  }

  onSave(data: { values: FormValue; currentRole: ProjectRoleSummary }) {
    if (this.form.invalid) {
      return;
    }
    this.roleFacade.update(data).then(() => {
      this.notificationService.success({
        title: "notification.action.changes_saved",
      });
    });
  }
  async deleteRole(currentRole: ProjectRoleSummary, projectDetail: ProjectDetail) {
    await this.roleFacade.deleteRole(currentRole, projectDetail);
  }
}
