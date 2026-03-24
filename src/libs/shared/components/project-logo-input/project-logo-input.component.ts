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

import { ChangeDetectionStrategy, Component, computed, inject, input, model, output, resource } from "@angular/core";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { CreateProjectPayload, ProjectSummary, UpdateProjectPayload } from "@tenzu/repository/project";
import { FileDownloaderService } from "@tenzu/utils/services/fileDownloader/file-downloader.service";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { NotificationService } from "@tenzu/utils/services/notification";
import { FileSizePipe } from "@tenzu/pipes/humanize-file-size";
import { TranslocoDirective } from "@jsverse/transloco";
import { FileInputComponent } from "@tenzu/shared/components/file-input/file-input.component";
import { FileValue } from "@tenzu/repository/base/misc.model";

@Component({
  selector: "app-project-logo-input",
  imports: [AvatarComponent, TranslocoDirective, FileSizePipe, FileInputComponent],
  template: `
    <ng-container *transloco="let t">
      @let _projectModel = projectModel();
      @let avatar = projectAvatarResource.value();
      @let maxUploadFileSize = configAppService.config().avatars.maxUploadFileSize;
      <app-avatar size="xl" [name]="_projectModel.name" [color]="_projectModel.color" [imageData]="avatar" />
      <div class="flex flex-col justify-stretch gap-2">
        <app-file-input
          [allowedFormats]="allowedFormats()"
          [maxUploadFileSize]="maxUploadFileSize"
          [iconName]="avatar ? 'edit' : 'upload'"
          [showDelete]="!!avatar"
          translocoUploadKey="project.logo.upload"
          translocoDeleteKey="project.logo.delete"
          (selectFile)="onFileSelected($event)"
        />
        <p class="mat-body-small text-on-surface-variant">
          <span>{{ t("avatar.allowed_format", { formats: allowedFormats() }) }}</span>
          @if (maxUploadFileSize) {
            <br />
            <span>{{ t("avatar.max_size", { size: (maxUploadFileSize | humanizeFileSize) }) }}</span>
          }
        </p>
      </div>
    </ng-container>
  `,
  styles: ``,
  host: {
    class: "flex flex-row gap-4 items-center",
  },
  providers: [FileSizePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectLogoInputComponent {
  readonly fileDownloaderService = inject(FileDownloaderService);
  readonly configAppService = inject(ConfigAppService);
  readonly notificationService = inject(NotificationService);

  projectModel = model.required<CreateProjectPayload | UpdateProjectPayload>();
  projectLogo = input<FileValue>();
  projectLogoUrl = input<ProjectSummary["logo"]>();
  changed = output();
  projectAvatarResource = resource({
    params: () => ({ logoFile: this.projectLogo(), logoUrl: this.projectLogoUrl() }),
    loader: async ({ params }) => {
      if (params.logoFile) {
        return await this.fileDownloaderService.convertFileToBase64(params.logoFile);
      }
      if (params.logoUrl && params.logoFile !== "") {
        return await this.fileDownloaderService.convertUrlToBase64(params.logoUrl, { format: "large" });
      }
      return null;
    },
  });
  allowedFormats = computed(() => this.configAppService.config().avatars.allowedFormats.join(", "));

  onFileSelected(file: FileValue): void {
    this.projectModel.update((value) => ({ ...value, logo: file }));
    this.changed.emit();
  }
}
