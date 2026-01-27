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

import { ChangeDetectionStrategy, Component, inject, input, model, output, resource } from "@angular/core";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { CreateProjectPayload, ProjectSummary, UpdateProjectPayload } from "@tenzu/repository/project";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { FileDownloaderService } from "@tenzu/utils/services/fileDownloader/file-downloader.service";
import { ButtonDeleteComponent } from "@tenzu/shared/components/ui/button/button-delete.component";
import { ConfirmDirective } from "@tenzu/directives/confirm";

@Component({
  selector: "app-project-logo-input",
  imports: [AvatarComponent, ButtonComponent, ButtonDeleteComponent, ConfirmDirective],
  template: `
    @let _projectModel = projectModel();
    @let avatar = projectAvatarResource.value();
    <div class="relative">
      <app-avatar size="xl" [name]="_projectModel.name" [color]="_projectModel.color" [imageData]="avatar">
      </app-avatar>
      @if (avatar) {
        <app-button-delete
          type="button"
          class="absolute top-0 end-0 z-20"
          [translocoKey]="'project.logo.delete'"
          [iconOnly]="true"
          (click)="clearInput(fileUpload)"
        />
      }
    </div>
    <input type="file" [hidden]="true" (change)="onFileSelected({ event: $event })" #fileUpload />
    <div class="flex flex-col justify-stretch gap-2">
      <app-button
        level="primary"
        translocoKey="project.logo.upload"
        type="button"
        iconName="upload"
        (click)="resetInput(fileUpload); fileUpload.click()"
      />
      <p class="mat-body-small text-on-surface-variant">
        <span>test</span><br />
        <span>test2</span>
      </p>
    </div>
  `,
  styles: ``,
  host: {
    class: "flex flex-row gap-4 items-center",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectLogoInputComponent {
  projectModel = model.required<CreateProjectPayload | UpdateProjectPayload>();
  projectLogo = input<ProjectSummary["logo"]>();
  changed = output();
  fileDownloaderService = inject(FileDownloaderService);
  projectAvatarResource = resource({
    params: () => ({ logoFile: this.projectModel().logo, logoUrl: this.projectLogo() }),
    loader: async ({ params }) => {
      if (params.logoFile) {
        return await this.fileDownloaderService.convertFileToBase64(params.logoFile);
      }
      if (params.logoUrl && params.logoFile !== "") {
        return await this.fileDownloaderService.convertUrlToBase64(params.logoUrl, { format: "original" });
      }
      return null;
    },
  });

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
    // TODO validate file size
    // TODO add file input attribute accept=".png,.jpg" etc for image type from config
    this.projectModel.update((value) => ({ ...value, logo: file }));
    this.changed.emit();
  }
}
