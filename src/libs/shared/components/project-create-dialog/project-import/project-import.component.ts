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

import { ChangeDetectionStrategy, Component, inject, input, output } from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import { FileInputComponent } from "@tenzu/shared/components/file-input/file-input.component";
import { FileValue } from "@tenzu/repository/base/misc.model";
import { ProjectImportationRepositoryService, ProjectImportationType } from "@tenzu/repository/importation";
import { WorkspaceSummary } from "@tenzu/repository/workspace";
import { HttpErrorResponse } from "@angular/common/http";
import { debug } from "@tenzu/utils/functions/logging";
import { NotificationService } from "@tenzu/utils/services/notification";
import { getLocError } from "@tenzu/utils/functions/errors";

@Component({
  selector: "app-project-import",
  imports: [TranslocoDirective, FileInputComponent],
  template: `
    <ng-container *transloco="let t">
      <app-file-input
        allowedFormats=".json"
        translocoUploadKey="project.new_project.import.taiga"
        (selectFile)="onFileSelected($event)"
      />
      <a href="https://tenzu.net/docs/import" target="_blank" class="mat-body-small text-on-primary-container">{{
        t("project.new_project.import.taiga_doc")
      }}</a>
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "flex flex-col gap-1 items-end",
  },
})
export class ProjectImportComponent {
  readonly importationRepositoryService = inject(ProjectImportationRepositoryService);
  readonly notificationService = inject(NotificationService);
  workspaceId = input.required<WorkspaceSummary["id"]>();
  submitted = output<void>();

  async onFileSelected(file: FileValue) {
    if (file) {
      try {
        await this.importationRepositoryService.createProjectImportation(
          { originType: ProjectImportationType.TAIGA, source: file },
          { workspaceId: this.workspaceId() },
        );
        this.submitted.emit();
      } catch (errorResponse) {
        if (errorResponse instanceof HttpErrorResponse && errorResponse.status === 422) {
          debug("error-422", "importation", errorResponse);
          const errorDetail = getLocError(errorResponse, "source");
          if (errorDetail) {
            this.notificationService.error({
              title: "project.new_project.import.422",
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
