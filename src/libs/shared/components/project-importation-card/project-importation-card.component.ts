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

import { Component, computed, inject, input, output } from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import { WorkspaceSummary } from "@tenzu/repository/workspace/workspace.model";
import { ImportationStatus, ProjectImportation } from "@tenzu/repository/importation/importation.model";
import { MatIcon } from "@angular/material/icon";
import { MatProgressBar } from "@angular/material/progress-bar";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { ProjectLandingPageUrl } from "@tenzu/pipes/url/project-landing-page-url.pipe";
import { ButtonCancelComponent } from "@tenzu/shared/components/ui/button/button-cancel.component";
import { ConfirmDirective } from "@tenzu/directives/confirm";
import {
  CardBackdropDirective,
  CardComponent,
  CardHeaderActionDirective,
} from "@tenzu/shared/components/ui/card/card.component";
import { RandomColorService } from "@tenzu/utils/services/random-color/random-color.service";
import {
  ProjectImportationErrorDialog,
  ProjectImportationErrorDialogData,
} from "@tenzu/shared/components/project-importation-error-dialog/project-importation-error-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { matDialogConfig } from "@tenzu/utils/mat-config";

@Component({
  selector: "app-project-importation-card",
  imports: [
    CardComponent,
    CardBackdropDirective,
    CardHeaderActionDirective,
    TranslocoDirective,
    MatIcon,
    MatProgressBar,
    ButtonComponent,
    ProjectLandingPageUrl,
    ButtonCancelComponent,
    ConfirmDirective,
  ],
  template: `
    @let _color = color();
    @let _importation = projectImportation();
    @let _landingPage = _importation.project ? (_importation.project | projectLandingPageUrl) : null;
    @let _name = _importation.project?.name || "Lorem Ipsum";
    @let _description = _importation.project?.description || "Lorem Ipsum dolor sit amet";
    <app-card
      [name]="_name"
      [color]="_color"
      [logo]="_importation.project?.logo"
      [landingPage]="_landingPage"
      [description]="_description"
      [error]="hasError()"
      [backdrop]="!actionNeeded()"
      *transloco="let t"
    >
      <ng-container appCardBackdrop>
        @if (_importation.status === ImportationStatus.FAILURE) {
          <div class="flex flex-row p-0.5">
            <mat-icon class="text-error pr-3 self-center" aria-hidden="true">warning</mat-icon>
            <p class="mat-body-medium text-error align-middle">{{ t("project.new_project.import.failed") }}</p>
          </div>
          <app-button
            level="error"
            translocoKey="project.new_project.import.failed_details"
            (click)="openImportationError({ projectImportation, workspaceId })"
          />
        } @else {
          <div class="flex flex-col w-full">
            <p>{{ t("project.new_project.import.ongoing") }}</p>
            <div class="flex flex-row items-center gap-3 px-3 justify-stretch">
              <mat-progress-bar
                [mode]="_importation.extraData.progressPercentage ? 'determinate' : 'indeterminate'"
                [value]="_importation.extraData.progressPercentage"
              />
              <span>{{ _importation.extraData.progressPercentage || 0 }}%</span>
            </div>
            <app-button-cancel
              class="mt-2"
              level="tertiary"
              [iconName]="undefined"
              appConfirm
              (popupConfirm)="deleteImportation.emit(_importation.id)"
            />
          </div>
        }
      </ng-container>
      @if (actionNeeded()) {
        <app-button
          appCardHeaderAction
          level="warning"
          [iconOnly]="true"
          iconName="warning"
          translocoKey="project.new_project.import.action_needed"
          class="ms-auto"
          iconSize="sm"
          (click)="openInviteDialog.emit()"
        ></app-button>
      }
    </app-card>
  `,
  styles: ``,
})
export class ProjectImportationCardComponent {
  private readonly dialog = inject(MatDialog);
  protected readonly ImportationStatus = ImportationStatus;
  workspaceId = input.required<WorkspaceSummary["id"]>();

  deleteImportation = output<ProjectImportation["id"]>();
  openInviteDialog = output<void>();

  projectImportation = input.required<ProjectImportation>();
  hasError = computed(() => this.projectImportation().status === ImportationStatus.FAILURE);
  actionNeeded = computed(() => this.projectImportation().status === ImportationStatus.ACTION_NEEDED);
  color = computed(() => {
    const projectImportation = this.projectImportation();
    if (projectImportation.project) {
      return projectImportation.project.color;
    }
    const firstLetterCode = projectImportation.sourceName?.codePointAt(0);
    return RandomColorService.castToColor(firstLetterCode || 0);
  });

  openImportationError(data: ProjectImportationErrorDialogData) {
    this.dialog.open(ProjectImportationErrorDialog, {
      ...matDialogConfig,
      minWidth: 850,
      data: data,
    });
  }
}
