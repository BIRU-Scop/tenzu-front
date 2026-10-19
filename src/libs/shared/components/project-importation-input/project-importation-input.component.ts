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
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { FileInputComponent } from "@tenzu/shared/components/file-input/file-input.component";
import { FileValue } from "@tenzu/repository/base/misc.model";
import { ProjectImportationType } from "@tenzu/repository/importation/importation.model";
import { TusUploadRepositoryService } from "@tenzu/repository/importation/tus-upload-repository.service";
import { WorkspaceSummary } from "@tenzu/repository/workspace/workspace.model";
import { debug } from "@tenzu/utils/functions/logging";
import { NotificationService } from "@tenzu/utils/services/notification";
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
  readonly tusUploadRepositoryService = inject(TusUploadRepositoryService);
  readonly notificationService = inject(NotificationService);
  readonly liveAnnouncer = inject(LiveAnnouncer);
  readonly translocoService = inject(TranslocoService);
  workspaceId = input.required<WorkspaceSummary["id"]>();
  submitted = output<void>();
  iconName = input<IconName | undefined>("upload");
  translocoUploadKey = input("project.new_project.import.taiga");
  displayDoc = input(true);

  async onFileSelected(file: FileValue) {
    if (file instanceof File) {
      try {
        await this.tusUploadRepositoryService.start({
          file,
          workspaceId: this.workspaceId(),
          originType: ProjectImportationType.TAIGA,
        });
        this.submitted.emit();
        this.liveAnnouncer
          .announce(
            this.translocoService.translate("project.new_project.upload.notifications.started", {
              fileName: file.name,
            }),
          )
          .then();
      } catch (error) {
        debug("tus-upload", `creation of ${file.name} failed`, error);
        this.notificationService.error({
          title: "project.new_project.upload.notifications.failed",
          translocoTitle: true,
          translocoTitleParams: { fileName: file.name },
        });
      }
    }
  }
}
