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
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { DescriptionFieldComponent } from "@tenzu/shared/components/form/description-field";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatInput } from "@angular/material/input";
import { NotificationService } from "@tenzu/utils/services/notification";
import { ProjectDetail, ProjectRepositoryService } from "@tenzu/repository/project";
import { Router } from "@angular/router";
import { toObservable } from "@angular/core/rxjs-interop";
import { filterNotNull } from "@tenzu/utils/functions/rxjs.operators";
import { tap } from "rxjs";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { TranslocoDirective } from "@jsverse/transloco";
import { DeleteWarningButtonComponent } from "@tenzu/shared/components/delete-warning-button/delete-warning-button.component";
import { HasPermissionDirective } from "@tenzu/directives/permission.directive";
import { ProjectPermissions } from "@tenzu/repository/permission/permission.model";
import {
  FormFooterComponent,
  FormFooterSecondaryActionDirective,
} from "@tenzu/shared/components/ui/form-footer/form-footer.component";
import { ButtonSaveComponent } from "@tenzu/shared/components/ui/button/button-save.component";
import { ButtonUndoComponent } from "@tenzu/shared/components/ui/button/button-undo.component";

@Component({
  selector: "app-project-edit",
  imports: [
    AvatarComponent,
    DescriptionFieldComponent,
    FormsModule,
    MatError,
    MatLabel,
    MatFormField,
    MatInput,
    ReactiveFormsModule,
    TranslocoDirective,
    DeleteWarningButtonComponent,
    HasPermissionDirective,
    FormFooterComponent,
    ButtonSaveComponent,
    FormFooterSecondaryActionDirective,
    ButtonUndoComponent,
  ],
  template: `
    @let project = projectService.entityDetail();
    @if (project) {
      <ng-container *transloco="let t; scope: 'project'">
        <ng-container
          *appHasPermission="
            {
              actualEntity: project,
              requiredPermission: ProjectPermissions.MODIFY_PROJECT,
            };
            else noModifyPermission
          "
        >
          <div class="flex flex-col gap-y-8 w-min">
            <form class="flex flex-col gap-y-4" [formGroup]="form" (submit)="onSave(project)">
              <div class="flex flex-row gap-4 items-center">
                <app-avatar size="xl" [name]="form.controls.name.value!" [color]="project?.color || 0"></app-avatar>
                <mat-form-field class="w-96">
                  <mat-label>{{ t("project.settings.project_edit.name") }}</mat-label>
                  <input formControlName="name" matInput required placeholder="name" data-testid="project-name-input" />
                  @if (form.controls.name.hasError("required")) {
                    <mat-error>{{ t("project.settings.project_edit.errors.name_required") }}</mat-error>
                  }
                  @if (form.controls.name.hasError("maxlength")) {
                    <mat-error>{{ t("project.settings.project_edit.errors.name_max_length") }}</mat-error>
                  }
                </mat-form-field>
              </div>
              <app-description-field
                [options]="{ descriptionMaxLength: 200, maxRows: 8 }"
                formControlName="description"
              />
              <app-form-footer>
                <app-button-undo appFormFooterSecondaryAction (click)="reset()" [disabled]="form.pristine" />
                <app-button-save [disabled]="form.pristine" />
              </app-form-footer>
            </form>
            <app-delete-warning-button
              *appHasPermission="{
                actualEntity: project,
                requiredPermission: ProjectPermissions.DELETE_PROJECT,
              }"
              [translocoKeyTitle]="'project.settings.project_edit.delete_project_title'"
              [translocoKeyWarningMessage]="'project.settings.project_edit.delete_project_warning'"
              (popupConfirm)="onDelete(project)"
            />
          </div>
        </ng-container>
      </ng-container>
      <ng-template #noModifyPermission>
        <div class="flex flex-row gap-4 items-center" *transloco="let t">
          <app-avatar size="xl" [name]="form.controls.name.value" [color]="project.color || 0"></app-avatar>
          {{ project.name }}
        </div>
      </ng-template>
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProjectEditComponent {
  protected readonly ProjectPermissions = ProjectPermissions;

  notificationService = inject(NotificationService);
  projectService = inject(ProjectRepositoryService);
  router = inject(Router);
  fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    name: ["", [Validators.required, Validators.maxLength(80)]],
    description: [""],
  });
  constructor() {
    toObservable(this.projectService.entityDetail)
      .pipe(
        filterNotNull(),
        tap((project) =>
          this.form.patchValue({
            name: project.name,
            description: project.description,
          }),
        ),
      )
      .subscribe();
  }

  async onSave(project: ProjectDetail) {
    this.form.reset(this.form.value);
    if (this.form.valid) {
      await this.projectService.patchRequest(project.id, this.form.getRawValue(), { projectId: project.id });
      this.notificationService.success({
        title: "notification.action.changes_saved",
      });
    }
  }

  async onDelete(item: ProjectDetail) {
    const deletedProject = await this.projectService.deleteRequest(item, { projectId: item.id });
    await this.router.navigateByUrl("/");
    this.notificationService.warning({
      title: "notification.project.deleted",
      translocoTitleParams: { name: deletedProject?.name },
    });
  }

  reset() {
    const selectedEntity = this.projectService.entityDetail();
    if (selectedEntity) {
      this.form.reset({ ...selectedEntity });
    }
  }
}
