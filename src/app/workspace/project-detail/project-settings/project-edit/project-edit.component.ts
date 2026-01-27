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

import { ChangeDetectionStrategy, Component, inject, linkedSignal } from "@angular/core";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { DescriptionFieldComponent } from "@tenzu/shared/components/form/description-field";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatInput } from "@angular/material/input";
import { NotificationService } from "@tenzu/utils/services/notification";
import { ProjectDetail, ProjectRepositoryService, UpdateProjectPayload } from "@tenzu/repository/project";
import { Router } from "@angular/router";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { DeleteWarningButtonComponent } from "@tenzu/shared/components/delete-warning-button/delete-warning-button.component";
import { HasPermissionDirective } from "@tenzu/directives/permission.directive";
import { ProjectPermissions } from "@tenzu/repository/permission/permission.model";
import {
  FormFooterComponent,
  FormFooterSecondaryActionDirective,
} from "@tenzu/shared/components/ui/form-footer/form-footer.component";
import { ButtonSaveComponent } from "@tenzu/shared/components/ui/button/button-save.component";
import { ButtonUndoComponent } from "@tenzu/shared/components/ui/button/button-undo.component";
import { form, FormField, maxLength, required, submit } from "@angular/forms/signals";
import { AsyncPipe } from "@angular/common";
import { GetBase64FromImageUrlPipe } from "@tenzu/pipes/get-base64-from-image-url.pipe";

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
    FormField,
    AsyncPipe,
    GetBase64FromImageUrlPipe,
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
            <form class="flex flex-col gap-y-4" (submit)="submit(project, $event)">
              <div class="flex flex-row gap-4 items-center">
                <app-avatar size="xl" [name]="projectForm.name().value()" [color]="project.color || 0"></app-avatar>
                <mat-form-field class="w-96">
                  <mat-label>{{ t("project.settings.project_edit.name") }}</mat-label>
                  <input [formField]="projectForm.name" matInput placeholder="name" data-testid="project-name-input" />
                  @for (error of projectForm.name().errors(); track error.kind) {
                    <mat-error>{{ t(error.message || "") }}</mat-error>
                  }
                </mat-form-field>
              </div>
              <app-description-field [options]="{ maxRows: 8 }" [formField]="projectForm.description" />
              <app-form-footer>
                <app-button-undo appFormFooterSecondaryAction (click)="reset()" [disabled]="!projectForm().dirty()" />
                <app-button-save [disabled]="!projectForm().dirty() || projectForm().invalid()" />
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
          <app-avatar
            size="xl"
            [name]="projectForm.name().value()"
            [color]="project.color || 0"
            [imageData]="project.logo | getBase64FromImageUrl: 'large' | async"
          ></app-avatar>
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

  translocoService = inject(TranslocoService);
  notificationService = inject(NotificationService);
  projectService = inject(ProjectRepositoryService);
  router = inject(Router);

  projectForm = form(
    linkedSignal<UpdateProjectPayload>(() => {
      const project = this.projectService.entityDetail();
      return project
        ? {
            name: project.name,
            description: project.description,
          }
        : {
            name: "",
            description: "",
          };
    }),
    (schemaPath) => {
      required(schemaPath.name, { message: "form_errors.required" });
      maxLength(schemaPath.name, 80, {
        message: () =>
          this.translocoService.translate("form_errors.max_length", {
            number: 80,
          }),
      });

      maxLength(schemaPath.description, 200, {
        message: () =>
          this.translocoService.translate("form_errors.max_length", {
            number: 200,
          }),
      });
    },
  );

  async submit(project: ProjectDetail, event: Event) {
    event.preventDefault();
    await submit(this.projectForm, async (form) => {
      await this.projectService.patchRequest(project.id, form().value(), { projectId: project.id });
      this.notificationService.success({
        title: "notification.action.changes_saved",
      });
    });
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
      this.projectForm().reset({ ...selectedEntity });
    }
  }
}
