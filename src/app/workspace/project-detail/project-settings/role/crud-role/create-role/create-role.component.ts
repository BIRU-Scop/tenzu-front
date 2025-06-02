/*
 * Copyright (C) 2025 BIRU
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

import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormValue, RoleFacade } from "../role.facade";
import { ProjectPermissions } from "@tenzu/repository/permission/permission.model";
import { FormRoleComponent } from "../form-role/form-role.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PermissionOrRedirectDirective } from "@tenzu/directives/permission.directive";
import { MatButton } from "@angular/material/button";
import { TranslocoDirective } from "@jsverse/transloco";
import { ProjectDetail } from "@tenzu/repository/project";
import { NotificationService } from "@tenzu/utils/services/notification";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-create-role",
  imports: [
    FormRoleComponent,
    FormsModule,
    MatButton,
    TranslocoDirective,
    ReactiveFormsModule,
    PermissionOrRedirectDirective,
  ],
  template: ` @let projectDetail = currentProjectDetail();
    @if (projectDetail) {
      <ng-container *transloco="let t">
        <ng-container
          [appPermissionOrRedirect]="{
            requiredPermission: ProjectPermissions.CREATE_MODIFY_DELETE_ROLE,
            expectedId: projectDetail.id,
            type: 'project',
          }"
        >
          <form
            [formGroup]="form"
            (submit)="onSave({ values: form.getRawValue(), projectId: projectDetail.id })"
            class="flex flex-col"
          >
            <app-form-role [form]="form" />
            <div class="flex">
              <button mat-flat-button [disabled]="form.pristine" type="submit" class="tertiary-button">
                {{ t("project.settings.roles.create_role") }}
              </button>
            </div>
          </form>
        </ng-container>
      </ng-container>
    }`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CreateRoleComponent {
  readonly roleFacade = inject(RoleFacade);
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly notificationService = inject(NotificationService);
  readonly currentProjectDetail = this.roleFacade.currentProjectDetail;
  readonly ProjectPermissions = ProjectPermissions;
  form = this.roleFacade.buildForm({ createMode: true });

  onSave(data: { values: FormValue; projectId: ProjectDetail["id"] }): void {
    if (this.form.invalid) {
      return;
    }
    this.roleFacade.create(data).then((role) => {
      this.notificationService.success({
        title: "notification.action.created_success",
      });
      this.router.navigate(["..", "edit-role", role.id], { relativeTo: this.route }).then();
    });
  }
}
