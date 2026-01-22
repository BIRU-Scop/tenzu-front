/*
 * Copyright (C) 2026 BIRU
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

import { ChangeDetectionStrategy, Component, effect, inject } from "@angular/core";
import { AbstractControl, Validators } from "@angular/forms";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { TranslocoDirective } from "@jsverse/transloco";
import { ButtonCloseComponent } from "@tenzu/shared/components/ui/button/button-close.component";
import { ButtonAddComponent } from "@tenzu/shared/components/ui/button/button-add.component";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { DescriptionFieldComponent } from "@tenzu/shared/components/form/description-field";
import { MatOption } from "@angular/material/core";
import { MatSelect } from "@angular/material/select";
import { Router } from "@angular/router";
import { ProjectRepositoryService } from "@tenzu/repository/project";
import { WorkspaceRepositoryService, WorkspaceSummary } from "@tenzu/repository/workspace";
import { RandomColorService } from "@tenzu/utils/services/random-color/random-color.service";

export type ProjectCreateDialogData = {
  workspaceId: WorkspaceSummary["id"];
};

@Component({
  selector: "app-project-create-dialog",
  imports: [
    MatDialogContent,
    MatFormField,
    MatDialogActions,
    MatDialogClose,
    MatError,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    TranslocoDirective,
    ButtonCloseComponent,
    ButtonAddComponent,
    AvatarComponent,
    DescriptionFieldComponent,
    MatOption,
    MatSelect,
    ButtonCloseComponent,
    ButtonAddComponent,
  ],
  template: `
    <ng-container *transloco="let t">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-dialog-content class="min-w-96">
          <div class="flex flex-col gap-y-2">
            <h1 class="mat-headline-medium">{{ t("project.new_project.title") }}</h1>
            <mat-form-field>
              <mat-label>{{ t("commons.workspace") }}</mat-label>
              <mat-select required formControlName="workspaceId">
                @for (workspace of workspaceRepositoryService.entitiesSummary(); track workspace.id) {
                  <mat-option value="{{ workspace.id }}" [disabled]="!workspace.userCanCreateProjects">
                    <div class="flex gap-x-2 items-center">
                      <app-avatar size="sm" [name]="workspace.name" [color]="workspace.color" [rounded]="true" />
                      <span>{{ workspace.name }}</span>
                    </div>
                  </mat-option>
                }
              </mat-select>
              @if (form.controls.workspaceId.hasError("required")) {
                <mat-error [innerHTML]="t('project.new_project.workspace_required')"></mat-error>
              }
              @if (form.controls.workspaceId.hasError("forbiddenWorkspace")) {
                <mat-error [innerHTML]="t('project.new_project.workspace_forbidden')"></mat-error>
              }
            </mat-form-field>
            <mat-form-field>
              <mat-label>{{ t("project.new_project.name") }}</mat-label>
              <input formControlName="name" matInput required placeholder="name" data-testid="project-name-input" />
              @if (form.controls.name.hasError("required")) {
                <mat-error
                  data-testid="project-name-required-error"
                  [innerHTML]="t('project.new_project.name_required')"
                ></mat-error>
              } @else if (form.controls.name.hasError("maxlength")) {
                <mat-error
                  data-testid="project-name-maxlength-error"
                  [innerHTML]="t('form_errors.max_length', { length: 80 })"
                ></mat-error>
              }
            </mat-form-field>
            <app-description-field
              [options]="{ descriptionMaxLength: 200, maxRows: 8 }"
              formControlName="description"
            ></app-description-field>
            <app-avatar size="lg" [name]="form.controls.name.value" [color]="form.controls.color.value"></app-avatar>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions class="!flex-nowrap gap-4">
          <app-button-close mat-dialog-close translocoKey="commons.cancel" />
          <app-button-add
            translocoKey="project.new_project.create_project"
            (click)="onSubmit()"
            [disabled]="!form.dirty || form.invalid"
          />
        </mat-dialog-actions>
      </form>
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCreateDialog {
  readonly dialogRef = inject(MatDialogRef<ProjectCreateDialog>);
  data = inject<ProjectCreateDialogData>(MAT_DIALOG_DATA);
  projectRepositoryService = inject(ProjectRepositoryService);
  workspaceRepositoryService = inject(WorkspaceRepositoryService);
  router = inject(Router);

  fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    name: ["", [Validators.required, Validators.maxLength(80)]],
    description: [""],
    color: [RandomColorService.randomColorPicker(), Validators.required],
    workspaceId: ["", [Validators.required, this.forbiddenWorkspaceValidator()]],
  });

  forbiddenWorkspaceValidator() {
    return (control: AbstractControl) => {
      const workspace = this.workspaceRepositoryService.entityMapSummary()[control.value];
      if (!workspace?.userCanCreateProjects) {
        return { forbiddenWorkspace: true };
      }
      return null;
    };
  }

  constructor() {
    if (!this.workspaceRepositoryService.entitiesSummary().length) {
      this.workspaceRepositoryService.listRequest().then();
    }

    effect(async () => {
      if (this.data.workspaceId && this.workspaceRepositoryService.entitiesSummary()?.length > 0) {
        this.form.controls.workspaceId.setValue(this.data.workspaceId);
        this.form.controls.workspaceId.markAsTouched();
      }
    });
  }

  async onSubmit() {
    this.form.reset(this.form.value);
    if (this.form.valid) {
      const { workspaceId, ...values } = this.form.getRawValue();
      const project = await this.projectRepositoryService.createRequest(values, { workspaceId });
      this.router.navigateByUrl(`/workspace/${project.workspaceId}/project/${project.id}/kanban/main`).then();
      this.dialogRef.close();
    }
  }
}
