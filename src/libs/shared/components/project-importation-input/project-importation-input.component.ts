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

import { Component, inject, input, output } from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import { FileInputComponent } from "@tenzu/shared/components/file-input/file-input.component";
import { FileValue } from "@tenzu/repository/base/misc.model";
import { ProjectImportationRepositoryService, ProjectImportationType } from "@tenzu/repository/importation";
import { WorkspaceSummary } from "@tenzu/repository/workspace";
import { HttpErrorResponse } from "@angular/common/http";
import { debug } from "@tenzu/utils/functions/logging";
import { NotificationService } from "@tenzu/utils/services/notification";
import { getLocError } from "@tenzu/utils/functions/errors";
import { IconName } from "@tenzu/shared/components/ui/ui.types";

@Component({
  selector: "app-project-importation-input",
  imports: [TranslocoDirective, FileInputComponent],
  template: `
    <ng-container *transloco="let t">
      <app-file-input
        [iconName]="iconName()"
        allowedFormats=".json"
        [translocoUploadKey]="translocoUploadKey()"
        (selectFile)="onFileSelected($event)"
      />
      @if (displayDoc()) {
        <a href="https://tenzu.net/docs/import" target="_blank" class="mat-body-small">{{
          t("project.new_project.import.taiga_doc")
        }}</a>
      }
    </ng-container>
  `,
  styles: ``,
  host: {
    class: "flex flex-col gap-2 items-end",
  },
})
export class ProjectImportationInputComponent {
  readonly importationRepositoryService = inject(ProjectImportationRepositoryService);
  readonly notificationService = inject(NotificationService);
  workspaceId = input.required<WorkspaceSummary["id"]>();
  submitted = output<void>();
  iconName = input<IconName | undefined>("upload");
  translocoUploadKey = input("project.new_project.import.taiga");
  displayDoc = input(true);

  async onFileSelected(file: FileValue) {
    if (file) {
      try {
        await this.importationRepositoryService.createRequest(
          { originType: ProjectImportationType.TAIGA, source: file },
          { workspaceId: this.workspaceId() },
        );
        this.submitted.emit();
      } catch (errorResponse) {
        if (errorResponse instanceof HttpErrorResponse && errorResponse.status === 422) {
          debug("error-422", "projectImportation", errorResponse);
          const errorDetail = getLocError(errorResponse, "source");
          if (errorDetail) {
            this.notificationService.error({
              title: "project.new_project.import.errors.422",
              translocoTitle: true,
              translocoTitleParams: { error: errorDetail },
            });
            return;
          }
        }
        throw errorResponse;
      }
    }
  }
}
