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

import { ChangeDetectionStrategy, Component, computed, inject, Signal } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { ButtonCloseComponent } from "@tenzu/shared/components/ui/button/button-close.component";
import { ProjectRepositoryService } from "@tenzu/repository/project";
import { ButtonDeleteComponent } from "@tenzu/shared/components/ui/button/button-delete.component";
import {
  ImportationError,
  ProjectImportation,
  ProjectImportationRepositoryService,
} from "@tenzu/repository/importation";
import { ProjectImportationInputComponent } from "@tenzu/shared/components/project-importation-input/project-importation-input.component";
import { WorkspaceSummary } from "@tenzu/repository/workspace";
import { ConfirmDirective } from "@tenzu/directives/confirm";

export type ProjectImportationErrorDialogData = {
  projectImportation: Signal<ProjectImportation>;
  workspaceId: Signal<WorkspaceSummary["id"]>;
};

@Component({
  selector: "app-project-create-dialog",
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    ReactiveFormsModule,
    TranslocoDirective,
    ButtonCloseComponent,
    ButtonCloseComponent,
    ButtonDeleteComponent,
    ProjectImportationInputComponent,
    ConfirmDirective,
    MatDialogTitle,
  ],
  template: `
    @let _importation = data.projectImportation();
    @let _workspaceId = data.workspaceId();
    <div class="p-6 flex flex-col justify-between" *transloco="let t">
      <app-button-close mat-dialog-close class="absolute top-2 end-2" [iconOnly]="true" />
      <h2 id="aria-label" mat-dialog-title>{{ t("project.new_project.import.failed") }}</h2>
      <mat-dialog-content [innerHTML]="t(errorTranslocoKey(), { fileName: _importation.sourceName })">
      </mat-dialog-content>
      <mat-dialog-actions class="!flex-nowrap flex flex-row gap-4">
        <app-button-delete
          [iconName]="undefined"
          appConfirm
          [data]="{
            deleteAction: true,
          }"
          (popupConfirm)="deleteImportation(_importation.id, _workspaceId)"
        >
          {{ t("commons.delete") }}
        </app-button-delete>
        <app-project-importation-input
          [workspaceId]="_workspaceId"
          [displayDoc]="false"
          translocoUploadKey="project.new_project.import.failed_redo"
          [iconName]="undefined"
          (submitted)="deleteImportation(_importation.id, _workspaceId)"
        />
      </mat-dialog-actions>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectImportationErrorDialog {
  readonly dialogRef = inject(MatDialogRef<ProjectImportationErrorDialog>);
  readonly translocoService = inject(TranslocoService);
  readonly projectRepositoryService = inject(ProjectRepositoryService);
  readonly importationRepositoryService = inject(ProjectImportationRepositoryService);
  data = inject<ProjectImportationErrorDialogData>(MAT_DIALOG_DATA);

  errorTranslocoKey = computed(() => {
    const projectImportation = this.data.projectImportation();
    if (
      projectImportation.extraData.errorCode &&
      Object.values(ImportationError).includes(projectImportation.extraData.errorCode)
    ) {
      return `project.new_project.import.errors.${this.data.projectImportation().extraData.errorCode}`;
    } else {
      return "project.new_project.import.errors.unknown";
    }
  });

  async deleteImportation(projectImportationId: ProjectImportation["id"], workspaceId: WorkspaceSummary["id"]) {
    this.dialogRef.close();
    await this.importationRepositoryService.deleteRequest({ projectImportationId, workspaceId });
  }
}
