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

import { Component, computed, input, output } from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatProgressBar } from "@angular/material/progress-bar";
import { MatTooltip } from "@angular/material/tooltip";
import { DateFormatOptions, TranslocoDatePipe } from "@jsverse/transloco-locale";
import { FileSizePipe } from "@tenzu/pipes/humanize-file-size";
import { FileInputComponent } from "@tenzu/shared/components/file-input/file-input.component";
import { FileValue } from "@tenzu/repository/base/misc.model";
import { TusUploadState } from "@tenzu/repository/importation/tus-upload.model";
import {
  CardBackdropActionsDirective,
  CardBackdropContentDirective,
  CardBackdropHeaderDirective,
  CardBackdropSubtitleDirective,
  CardBackdropTitleDirective,
  CardComponent,
} from "@tenzu/shared/components/ui/card/card.component";
import { ButtonCancelComponent } from "@tenzu/shared/components/ui/button/button-cancel.component";
import { ButtonCloseComponent } from "@tenzu/shared/components/ui/button/button-close.component";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { RandomColorService } from "@tenzu/utils/services/random-color/random-color.service";
import { ConfirmDirective } from "@tenzu/directives/confirm";

export const DEADLINE_FORMAT: DateFormatOptions = { dateStyle: "medium", timeStyle: "short" };

@Component({
  selector: "app-tus-upload-card",
  imports: [
    CardComponent,
    CardBackdropHeaderDirective,
    CardBackdropTitleDirective,
    CardBackdropSubtitleDirective,
    CardBackdropContentDirective,
    CardBackdropActionsDirective,
    TranslocoDirective,
    MatProgressBar,
    MatTooltip,
    TranslocoDatePipe,
    FileSizePipe,
    FileInputComponent,
    ButtonCancelComponent,
    ButtonCloseComponent,
    ButtonComponent,
    ConfirmDirective,
  ],
  host: { role: "group", "[attr.aria-label]": "tusUploadState().fileName" },
  template: `
    @let _tusUploadState = tusUploadState();
    @let _translocoValue = { fileName: _tusUploadState.fileName };
    <app-card
      [name]="_tusUploadState.fileName"
      [color]="color()"
      description="Lorem Ipsum dolor sit amet"
      [backdrop]="true"
      *transloco="let t"
    >
      <div appCardBackdropHeader [matTooltip]="_tusUploadState.fileName">
        <p appCardBackdropTitle [attr.role]="failure() ? 'alert' : 'status'">{{ t(labelKey()) }}</p>
        @if (_tusUploadState.status === "interrupted") {
          <p appCardBackdropSubtitle>
            {{
              t("project.new_project.upload.interrupted_hint", {
                fileName: _tusUploadState.fileName,
                fileSize: _tusUploadState.fileSize | humanizeFileSize,
              })
            }}
          </p>
        }
        @if (_tusUploadState.status === "paused") {
          <p appCardBackdropSubtitle>
            {{
              t("project.new_project.upload.deadline", {
                date: _tusUploadState.expiresAt | translocoDate: deadlineFormat,
              })
            }}
          </p>
        }
      </div>
      <div appCardBackdropContent>
        <mat-progress-bar
          class="grow"
          mode="determinate"
          [value]="percentage()"
          [attr.aria-label]="t('project.new_project.upload.progress_label', _translocoValue)"
        />
        <div class="size-8 shrink-0">
          @if (pausable() || _tusUploadState.status === "paused") {
            <app-button
              level="tertiary"
              [iconOnly]="true"
              [iconNoBackground]="true"
              [iconName]="_tusUploadState.status === 'paused' ? 'resume' : 'pause'"
              [translocoKey]="
                _tusUploadState.status === 'paused'
                  ? 'project.new_project.upload.actions.resume'
                  : 'project.new_project.upload.actions.pause'
              "
              [translocoValue]="_translocoValue"
              (click)="_tusUploadState.status === 'paused' ? resumed.emit() : paused.emit()"
            />
          }
        </div>
      </div>
      <div appCardBackdropActions>
        @if (_tusUploadState.status === "rejected") {
          @if (_tusUploadState.errorMessage) {
            <app-button
              level="warning"
              iconName="details"
              translocoKey="project.new_project.upload.actions.details"
              (click)="detailsOpened.emit()"
            />
          }
          <app-button-close level="tertiary" (click)="closed.emit()" />
        } @else {
          @if (_tusUploadState.status === "interrupted") {
            <app-file-input
              allowedFormats=".json"
              level="primary"
              translocoUploadKey="project.new_project.upload.actions.choose_file"
              (selectFile)="onFileSelected($event)"
            />
          }
          @if (_tusUploadState.status === "failed") {
            <app-button
              level="primary"
              iconName="replay"
              translocoKey="project.new_project.upload.actions.retry"
              (click)="retried.emit()"
            />
          }
          <app-button-cancel
            level="error"
            [disabled]="_tusUploadState.status === 'canceling'"
            appConfirm
            [data]="{
              message: t('project.new_project.upload.confirm_cancel', {
                fileName: _tusUploadState.fileName,
                percentage: percentage(),
              }),
              actionButtonContent: 'project.new_project.upload.actions.confirm_cancel',
              deleteAction: true,
            }"
            (popupConfirm)="canceled.emit()"
          />
        }
      </div>
    </app-card>
  `,
})
export class TusUploadCardComponent {
  readonly deadlineFormat = DEADLINE_FORMAT;
  tusUploadState = input.required<TusUploadState>();
  percentage = computed(() => {
    const { bytesSent, fileSize } = this.tusUploadState();
    return fileSize ? Math.round((bytesSent / fileSize) * 100) : 0;
  });
  color = computed(() => RandomColorService.castToColor(this.tusUploadState().fileName.codePointAt(0) ?? 0));
  pausable = computed(() => ["uploading", "retrying"].includes(this.tusUploadState().status));
  failure = computed(() => ["failed", "rejected"].includes(this.tusUploadState().status));

  labelKey = computed(() => {
    const { status, errorKey } = this.tusUploadState();
    return errorKey ?? `project.new_project.upload.status.${status}`;
  });

  onFileSelected(file: FileValue): void {
    if (file instanceof File) {
      this.resumedWith.emit(file);
    }
  }

  paused = output<void>();
  resumed = output<void>();
  canceled = output<void>();
  retried = output<void>();
  closed = output<void>();
  detailsOpened = output<void>();
  resumedWith = output<File>();
}
