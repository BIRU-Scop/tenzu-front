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
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { FileDownloaderService } from "@tenzu/utils/services/fileDownloader/file-downloader.service";
import { ButtonDeleteComponent } from "@tenzu/shared/components/ui/button/button-delete.component";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { NotificationService } from "@tenzu/utils/services/notification";
import { FileSizePipe } from "@tenzu/pipes/humanize-file-size";
import { TranslocoDirective } from "@jsverse/transloco";
import { ButtonEditComponent } from "@tenzu/shared/components/ui/button/button-edit.component";

@Component({
  selector: "app-project-logo-input",
  imports: [
    AvatarComponent,
    ButtonComponent,
    ButtonDeleteComponent,
    TranslocoDirective,
    FileSizePipe,
    ButtonEditComponent,
  ],
  template: `
    <ng-container *transloco="let t">
      @let _projectModel = projectModel();
      @let avatar = projectAvatarResource.value();
      @let maxUploadFileSize = configAppService.config().avatars.maxUploadFileSize;
      <app-avatar size="xl" [name]="_projectModel.name" [color]="_projectModel.color" [imageData]="avatar" />
      <input
        type="file"
        [accept]="allowedFormats()"
        [hidden]="true"
        (change)="onFileSelected({ event: $event })"
        #fileUpload
      />
      <div class="flex flex-col justify-stretch gap-2">
        @if (avatar) {
          <div class="flex flex-row gap-2">
            <app-button-edit
              type="button"
              class=""
              [translocoKey]="'project.logo.upload'"
              [iconOnly]="true"
              (click)="resetInput(fileUpload); fileUpload.click()"
            />
            <app-button-delete
              type="button"
              class=""
              [translocoKey]="'project.logo.delete'"
              [iconOnly]="true"
              (click)="clearInput(fileUpload)"
            />
          </div>
        } @else {
          <app-button
            level="primary"
            translocoKey="project.logo.upload"
            type="button"
            iconName="upload"
            (click)="resetInput(fileUpload); fileUpload.click()"
          />
        }
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
  readonly fileSizePipe = inject(FileSizePipe);

  projectModel = model.required<CreateProjectPayload | UpdateProjectPayload>();
  projectLogo = input<ProjectSummary["logo"]>();
  changed = output();
  projectAvatarResource = resource({
    params: () => ({ logoFile: this.projectModel().logo, logoUrl: this.projectLogo() }),
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

  // Necessary to avoid Chrome refusing to upload the file which has just been deleted
  resetInput(fileUpload: HTMLInputElement) {
    fileUpload.value = "";
  }
  clearInput(fileUpload: HTMLInputElement) {
    fileUpload.value = "";
    this.projectModel.update((value) => ({ ...value, logo: "" as const }));
    this.changed.emit();
  }

  onFileSelected(data: { event: Event }): void {
    const input = data.event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : "";
    if (file) {
      const maxUploadFileSize = this.configAppService.config().avatars.maxUploadFileSize;
      if (maxUploadFileSize && file.size > maxUploadFileSize) {
        this.notificationService.error({
          translocoTitle: true,
          title: "avatar.exceed_size",
          translocoTitleParams: { var: file.name, maxSize: this.fileSizePipe.transform(maxUploadFileSize) },
        });
        return;
      }
      this.projectModel.update((value) => ({ ...value, logo: file }));
      this.changed.emit();
    }
  }
}
