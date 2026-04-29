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

import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core";
import { AvatarComponent } from "../avatar/avatar.component";
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { TranslocoDirective } from "@jsverse/transloco";
import { WorkspaceSummary } from "@tenzu/repository/workspace";
import { ImportationStatus, ProjectImportation } from "@tenzu/repository/importation";
import { MatIcon } from "@angular/material/icon";
import { MatProgressBar } from "@angular/material/progress-bar";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import {
  ProjectImportationErrorDialog,
  ProjectImportationErrorDialogData,
} from "@tenzu/shared/components/project-importation-error-dialog/project-importation-error-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";

@Component({
  selector: "app-project-importation-card",
  imports: [
    AvatarComponent,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    TranslocoDirective,
    MatIcon,
    MatProgressBar,
    ButtonComponent,
  ],
  template: `
    @let _name = "Lorem Ipsum";
    @let _color = 3;
    @let _description = "Lorem Ipsum dolor sit amet";
    @let _workspaceId = workspaceId();
    @let _importation = projectImportation();
    <!--    TODO if error, card border error color -->
    <mat-card appearance="outlined" class="min-h-[100px] w-[200px]" *transloco="let t">
      <div class="z-50 h-full w-full backdrop-blur-sm flex flex-col items-center justify-center absolute text-center">
        @if (_importation.status === ImportationStatus.FAILURE) {
          <div class="flex flex-row p-0.5">
            <mat-icon class="text-error pr-3 self-center" aria-hidden="true">warning</mat-icon>
            <p class="mat-body-medium text-error align-middle">{{ t("project.new_project.import.failed") }}</p>
          </div>
          <app-button
            level="error"
            translocoKey="project.new_project.import.failed_details"
            (click)="openImportationError()"
          />
        } @else {
          <div class="flex flex-col w-full">
            <p>{{ t("project.new_project.import.ongoing") }}</p>
            <div class="flex flex-row items-center gap-3 px-3 justify-stretch">
              <mat-progress-bar mode="indeterminate"></mat-progress-bar>
              <span>0%</span>
            </div>
          </div>
        }
      </div>
      <mat-card-header aria-hidden="true">
        <app-avatar mat-card-avatar [name]="_name" [color]="_color" />
        <mat-card-title class="!contents min-h-[40px]">{{ _name }}</mat-card-title>
      </mat-card-header>
      <mat-card-content aria-hidden="true">
        <div class="pt-2 pl-2 flex flex-col gap-1">
          <p>
            {{ _description }}
          </p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectImportationCardComponent {
  protected readonly ImportationStatus = ImportationStatus;
  readonly dialog = inject(MatDialog);

  workspaceId = input.required<WorkspaceSummary["id"]>();
  projectImportation = input.required<ProjectImportation>();

  protected openImportationError() {
    const data: ProjectImportationErrorDialogData = {
      projectImportation: this.projectImportation,
      workspaceId: this.workspaceId,
    };
    this.dialog.open(ProjectImportationErrorDialog, {
      ...matDialogConfig,
      minWidth: 850,
      data: data,
    });
  }
}
