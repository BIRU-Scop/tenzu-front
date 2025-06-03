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
import { ConfirmDirective } from "@tenzu/directives/confirm";
import { DescriptionFieldComponent } from "@tenzu/shared/components/form/description-field";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { NotificationService } from "@tenzu/utils/services/notification";
import { ProjectDetail, ProjectRepositoryService } from "@tenzu/repository/project";
import { Router } from "@angular/router";
import { toObservable } from "@angular/core/rxjs-interop";
import { filterNotNull } from "@tenzu/utils/functions/rxjs.operators";
import { tap } from "rxjs";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: "app-project-edit",
  imports: [
    AvatarComponent,
    ConfirmDirective,
    DescriptionFieldComponent,
    FormsModule,
    MatButton,
    MatError,
    MatLabel,
    MatFormField,
    MatIcon,
    MatInput,
    ReactiveFormsModule,
    TranslocoDirective,
  ],
  template: `
    @let project = projectService.entityDetail();
    <div class="flex flex-col gap-y-8 w-min" *transloco="let t; prefix: 'project.settings.edit'">
      <form class="flex flex-col gap-y-4" [formGroup]="form" (submit)="onSave()">
        <div class="flex flex-row gap-4 items-center">
          <app-avatar size="xl" [name]="form.controls.name.value!" [color]="project?.color || 0"></app-avatar>
          <mat-form-field>
            <mat-label>{{ t("name") }}</mat-label>
            <input formControlName="name" matInput required placeholder="name" data-testid="project-name-input" />
            @if (form.controls.name.hasError("required")) {
              <mat-error data-testid="project-name-required-error">{{ t("errors.name_required") }}</mat-error>
            }
          </mat-form-field>
        </div>
        <app-description-field
          [options]="{ descriptionMaxLength: 200, maxRows: 8 }"
          formControlName="description"
        ></app-description-field>
        <div class="flex gap-x-4 mt-2">
          <button
            mat-flat-button
            type="submit"
            class="tertiary-button"
            data-testid="project-edit-submit"
            [disabled]="form.pristine"
          >
            {{ t("buttons.save") }}
          </button>
          <button mat-flat-button (click)="reset()" class="secondary-button">
            {{ t("buttons.cancel") }}
          </button>
        </div>
      </form>
      <div class="flex flex-col gap-y-2">
        <h2 class="mat-headline-small">{{ t("delete_project_title") }}</h2>
        <div class="flex flex-row">
          <mat-icon class="text-on-error-container pr-3 self-center">warning</mat-icon>
          <p class="mat-body-medium text-on-error-container align-middle">
            {{ t("delete_project_warning") }}
          </p>
        </div>
        <button
          mat-flat-button
          class="error-button w-fit"
          appConfirm
          [data]="{ deleteAction: true }"
          (popupConfirm)="project ? onDelete(project) : null"
        >
          {{ t("buttons.delete") }}
        </button>
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProjectEditComponent {
  notificationService = inject(NotificationService);
  projectService = inject(ProjectRepositoryService);
  router = inject(Router);
  fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    name: ["", Validators.required],
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

  async onSave() {
    this.form.reset(this.form.value);
    const project = this.projectService.entityDetail();
    if (this.form.valid && project) {
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
