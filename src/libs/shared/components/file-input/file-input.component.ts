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
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { ButtonDeleteComponent } from "@tenzu/shared/components/ui/button/button-delete.component";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { NotificationService } from "@tenzu/utils/services/notification";
import { FileSizePipe } from "@tenzu/pipes/humanize-file-size";
import { TranslocoDirective } from "@jsverse/transloco";
import { IconName } from "@tenzu/shared/components/ui/ui.types";
import { FileValue } from "@tenzu/repository/base/misc.model";

@Component({
  selector: "app-file-input",
  imports: [ButtonComponent, ButtonDeleteComponent, TranslocoDirective],
  template: `
    @let _showDelete = showDelete();
    <ng-container *transloco="let t">
      <input
        type="file"
        [accept]="allowedFormats()"
        [hidden]="true"
        (change)="onFileSelected({ event: $event })"
        #fileUpload
      />
      <div class="flex flex-row gap-2">
        <app-button
          type="button"
          [translocoKey]="translocoUploadKey()"
          [iconName]="iconName()"
          [iconOnly]="_showDelete"
          [level]="_showDelete ? 'secondary' : 'primary'"
          (click)="resetInput(fileUpload); fileUpload.click()"
        />
        @if (_showDelete) {
          <app-button-delete
            type="button"
            [translocoKey]="translocoDeleteKey()"
            [iconOnly]="true"
            (click)="clearInput(fileUpload)"
          />
        }
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
export class FileInputComponent {
  readonly configAppService = inject(ConfigAppService);
  readonly notificationService = inject(NotificationService);
  readonly fileSizePipe = inject(FileSizePipe);

  selectFile = output<FileValue>();
  allowedFormats = input<string>("");
  maxUploadFileSize = input<number | null>(null);
  iconName = input<IconName>("upload");
  showDelete = input<boolean>(false);
  translocoUploadKey = input.required<string>();
  translocoDeleteKey = input<string>("");

  // Necessary to avoid Chrome refusing to upload the file which has just been deleted
  resetInput(fileUpload: HTMLInputElement) {
    fileUpload.value = "";
  }
  clearInput(fileUpload: HTMLInputElement) {
    fileUpload.value = "";
    this.selectFile.emit("" as const);
  }

  onFileSelected(data: { event: Event }): void {
    const input = data.event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : "";
    if (file) {
      const _maxUploadFileSize = this.maxUploadFileSize();
      if (_maxUploadFileSize && file.size > _maxUploadFileSize) {
        this.notificationService.error({
          translocoTitle: true,
          title: "form_errors.exceed_file_size",
          translocoTitleParams: { var: file.name, maxSize: this.fileSizePipe.transform(_maxUploadFileSize) },
        });
        return;
      }
      this.selectFile.emit(file);
    }
  }
}
