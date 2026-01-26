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

import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { ButtonCloseComponent } from "@tenzu/shared/components/ui/button/button-close.component";
import { ButtonAddComponent } from "@tenzu/shared/components/ui/button/button-add.component";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { DescriptionFieldComponent } from "@tenzu/shared/components/form/description-field";
import { MatOption } from "@angular/material/core";
import { MatSelect, MatSelectTrigger } from "@angular/material/select";
import { Router } from "@angular/router";
import { CreateProjectPayload, ProjectRepositoryService } from "@tenzu/repository/project";
import { WorkspaceRepositoryService, WorkspaceSummary } from "@tenzu/repository/workspace";
import { RandomColorService } from "@tenzu/utils/services/random-color/random-color.service";
import {
  form,
  maxLength,
  readonly,
  required,
  validate,
  submit,
  FormField,
  applyWhenValue,
} from "@angular/forms/signals";

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
    FormField,
    MatSelectTrigger,
  ],
  template: `
    <ng-container *transloco="let t">
      <form (submit)="submit($event)">
        <mat-dialog-content class="min-w-96">
          <div class="flex flex-col gap-y-2">
            <h1 class="mat-headline-medium">{{ t("project.new_project.title") }}</h1>
            <mat-form-field>
              <mat-label>{{ t("commons.workspace") }}</mat-label>
              <mat-select [formField]="projectForm.workspaceId">
                <mat-select-trigger>{{ selectedWorkspace().name }}</mat-select-trigger>
                @for (workspace of workspaceRepositoryService.entitiesSummary(); track workspace.id) {
                  <mat-option value="{{ workspace.id }}" [disabled]="!workspace.userCanCreateProjects">
                    <div class="flex gap-x-2 items-center">
                      <app-avatar size="sm" [name]="workspace.name" [color]="workspace.color" [rounded]="true" />
                      <span>{{ workspace.name }}</span>
                    </div>
                  </mat-option>
                }
              </mat-select>
              @for (error of projectForm.workspaceId().errors(); track error.kind) {
                <mat-error>{{ t(error.message || "") }}</mat-error>
              }
            </mat-form-field>
            <mat-form-field>
              <mat-label>{{ t("project.new_project.name") }}</mat-label>
              <input [formField]="projectForm.name" matInput placeholder="name" data-testid="project-name-input" />
              @for (error of projectForm.name().errors(); track error.kind) {
                <mat-error>{{ t(error.message || "") }}</mat-error>
              }
            </mat-form-field>
            <app-description-field
              [options]="{ maxRows: 8 }"
              [formField]="projectForm.description"
            ></app-description-field>
            <app-avatar
              size="lg"
              [name]="projectForm.name().value()"
              [color]="projectForm.color().value()"
            ></app-avatar>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions class="!flex-nowrap gap-4">
          <app-button-close mat-dialog-close translocoKey="commons.cancel" />
          <app-button-add
            translocoKey="project.new_project.create_project"
            type="submit"
            [disabled]="!projectForm().dirty() || projectForm().invalid()"
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
  translocoService = inject(TranslocoService);
  projectRepositoryService = inject(ProjectRepositoryService);
  workspaceRepositoryService = inject(WorkspaceRepositoryService);
  router = inject(Router);

  projectModel = signal<CreateProjectPayload>({
    name: "",
    description: "",
    color: RandomColorService.randomColorPicker(),
    workspaceId: this.data.workspaceId,
  });
  projectForm = form(this.projectModel, (schemaPath) => {
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

    required(schemaPath.color, { message: "form_errors.required" });
    readonly(schemaPath.color);

    required(schemaPath.workspaceId, { message: "form_errors.required" });
    applyWhenValue(
      schemaPath,
      () => this.workspaceRepositoryService.entitiesSummary()?.length > 0,
      (schemaPath) => {
        validate(schemaPath.workspaceId, ({ value }) => {
          const workspace = this.workspaceRepositoryService.entityMapSummary()[value()];
          if (!workspace?.userCanCreateProjects) {
            return { kind: "forbiddenWorkspace", message: "project.new_project.workspace_forbidden" };
          }
          return null;
        });
      },
    );
  });

  selectedWorkspace = computed<WorkspaceSummary>(() => {
    return this.workspaceRepositoryService.entityMapSummary()[this.projectModel().workspaceId];
  });

  constructor() {
    if (!this.workspaceRepositoryService.entitiesSummary().length) {
      this.workspaceRepositoryService.listRequest().then();
    }
  }

  async submit(event: Event) {
    event.preventDefault();
    await submit(this.projectForm, async (form) => {
      const { workspaceId, ...values } = form().value();
      const project = await this.projectRepositoryService.createRequest(values, { workspaceId });
      this.router.navigateByUrl(`/workspace/${project.workspaceId}/project/${project.id}/kanban/main`).then();
      this.dialogRef.close();
    });
  }
}
