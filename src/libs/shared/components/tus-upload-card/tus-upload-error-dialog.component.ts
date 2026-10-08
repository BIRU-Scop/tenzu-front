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

import { Component, input } from "@angular/core";
import { MatDialogClose, MatDialogContent, MatDialogTitle } from "@angular/material/dialog";
import { TranslocoDirective } from "@jsverse/transloco";
import { TusUpload } from "@tenzu/repository/importation/tus-upload.model";
import { ButtonCloseComponent } from "@tenzu/shared/components/ui/button/button-close.component";

@Component({
  selector: "app-tus-upload-error-dialog",
  imports: [MatDialogTitle, MatDialogContent, MatDialogClose, TranslocoDirective, ButtonCloseComponent],
  template: `
    @let _tusUpload = tusUpload();
    <div class="p-6 flex flex-col gap-2" *transloco="let t">
      <app-button-close mat-dialog-close class="absolute top-2 end-2" [iconOnly]="true" />
      <h2 id="aria-label" mat-dialog-title>
        {{ t("project.new_project.upload.details_title", { fileName: _tusUpload.fileName }) }}
      </h2>
      <mat-dialog-content class="flex flex-col gap-2">
        @if (_tusUpload.errorKey) {
          <p class="mat-title-small">{{ t(_tusUpload.errorKey) }}</p>
        }
        <p class="whitespace-pre-wrap">{{ _tusUpload.errorMessage }}</p>
      </mat-dialog-content>
    </div>
  `,
})
export class TusUploadErrorDialog {
  tusUpload = input.required<TusUpload>();
}
