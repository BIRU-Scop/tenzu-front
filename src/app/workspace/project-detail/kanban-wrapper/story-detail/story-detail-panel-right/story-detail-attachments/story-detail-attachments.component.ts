/*
 * Copyright (C) 2025-2026 BIRU
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

import { ChangeDetectionStrategy, Component, effect, inject, input, untracked } from "@angular/core";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from "@angular/material/expansion";
import { TranslocoDirective } from "@jsverse/transloco";
import { StoryAttachment, StoryAttachmentRepositoryService } from "src/libs/repository/story-attachment";
import { StoryDetail } from "src/libs/repository/story";
import { ProjectDetail } from "src/libs/repository/project";
import { NotificationService } from "src/libs/utils/services/notification";
import { MatIcon } from "@angular/material/icon";
import { TranslocoDatePipe } from "@jsverse/transloco-locale";
import { ConfigAppService } from "src/libs/repository/config-app/config-app.service";
import { FileSizePipe } from "src/libs/shared/pipes/humanize-file-size";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";

@Component({
  selector: "app-story-detail-attachments",
  imports: [
    MatButton,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    TranslocoDirective,
    MatIcon,
    MatIconButton,
    MatIcon,
    TranslocoDatePipe,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem,
  ],
  template: `
    @let story = storyDetail();
    @let _hasModifyPermission = hasModifyPermission();
    <div class="flex flex-col gap-y-4" *transloco="let t; prefix: 'workflow.detail_story'">
      @if (_hasModifyPermission) {
        <button
          class="primary-button w-fit"
          mat-flat-button
          type="button"
          (click)="resetInput(fileUpload); fileUpload.click()"
        >
          <mat-icon class="icon-full">attach_file</mat-icon>
          {{ t("attachments.attach_file") }}
        </button>
        <input
          type="file"
          [hidden]="true"
          (change)="onFileSelected({ event: $event, storyDetail: story })"
          #fileUpload
        />
      }
      @let selectedStoryAttachments = storyAttachmentRepositoryService.entitiesSummary();
      @if (selectedStoryAttachments.length > 0) {
        <mat-expansion-panel expanded>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>attachment</mat-icon>
              Attachments ({{ selectedStoryAttachments.length }})
            </mat-panel-title>
          </mat-expansion-panel-header>
          <div class="overflow-x-auto">
            <table class="app-table table-auto lg:w-full">
              <thead class="app-table-header-group">
                <tr class="app-table-header-row">
                  <th class="app-table-header-cell">{{ t("attachments.name") }}</th>
                  <th class="hidden 2xl:app-table-header-cell">{{ t("attachments.size") }}</th>
                  <th class="hidden xl:app-table-header-cell">{{ t("attachments.date") }}</th>
                  <th class="app-table-header-cell sticky end-0 bg-surface-container !pe-0">
                    <span class="sr-only">{{ t("attachments.action") }}</span>
                  </th>
                </tr>
              </thead>
              <tbody class="app-table-row-group">
                @for (storyAttachment of selectedStoryAttachments; track storyAttachment.id) {
                  <tr class="app-table-row">
                    <td class="app-table-cell">
                      {{ storyAttachment.name }}
                    </td>
                    <td class="2xl:app-table-cell hidden">{{ storyAttachment.size }}</td>
                    <td class="xl:app-table-cell hidden">
                      {{ storyAttachment.createdAt | translocoDate: { dateStyle: "short", timeStyle: "short" } }}
                    </td>
                    <td class="app-table-cell  end-0 bg-surface-container !pe-0">
                      <mat-menu #appMenu="matMenu">
                        <button mat-menu-item (click)="previewFile(storyAttachment)" type="button">
                          <mat-icon>visibility</mat-icon>
                          <span>{{ t("attachments.preview") }}</span>
                        </button>
                        <button mat-menu-item (click)="downloadFile(storyAttachment)" type="button">
                          <mat-icon>download</mat-icon>
                          <span>{{ t("attachments.download") }}</span>
                        </button>
                        @if (_hasModifyPermission) {
                          <button mat-menu-item type="button" (click)="deleteAttachment(storyAttachment)">
                            <mat-icon>delete</mat-icon>
                            <span>{{ t("attachments.delete") }}</span>
                          </button>
                        }
                      </mat-menu>
                      <button mat-icon-button [matMenuTriggerFor]="appMenu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </mat-expansion-panel>
      }
    </div>
  `,
  styles: ``,
  providers: [FileSizePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryDetailAttachmentsComponent {
  storyAttachmentRepositoryService = inject(StoryAttachmentRepositoryService);
  notificationService = inject(NotificationService);

  readonly configAppService = inject(ConfigAppService);
  readonly fileSizePipe = inject(FileSizePipe);
  storyDetail = input.required<StoryDetail>();
  projectDetail = input.required<ProjectDetail>();
  hasModifyPermission = input(false);
  constructor() {
    effect(() => {
      this.storyAttachmentRepositoryService.resetAll();
      const storyDetail = this.storyDetail();
      untracked(() =>
        this.storyAttachmentRepositoryService
          .listRequest({
            projectId: storyDetail.projectId,
            ref: storyDetail.ref,
          })
          .then(),
      ).then();
    });
  }

  previewFile(row: StoryAttachment) {
    this.storyAttachmentRepositoryService.previewAttachment(row);
  }
  downloadFile(row: StoryAttachment) {
    this.storyAttachmentRepositoryService.downloadAttachment(row);
  }

  // Necessary to avoid Chrome refusing to upload the file which has just been deleted
  resetInput(fileUpload: HTMLInputElement) {
    fileUpload.value = "";
  }

  onFileSelected(data: { event: Event; storyDetail: StoryDetail }): void {
    const input = data.event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const maxUploadFileSize = this.configAppService.config().maxUploadFileSize;
      if (maxUploadFileSize && input.files[0].size > maxUploadFileSize) {
        this.notificationService.error({
          translocoTitle: true,
          title: "workflow.detail_story.attachments.exceed_size",
          translocoTitleParams: { var: input.files[0].name, maxSize: this.fileSizePipe.transform(maxUploadFileSize) },
        });
        return;
      }
      this.storyAttachmentRepositoryService
        .createAttachment(input.files[0], { projectId: this.projectDetail().id, ref: data.storyDetail.ref })
        .then();
    }
  }

  deleteAttachment(storyAttachment: StoryAttachment) {
    this.storyAttachmentRepositoryService
      .deleteRequest(storyAttachment, { attachmentId: storyAttachment.id })
      .then(() => {
        this.notificationService.success({
          translocoTitle: true,
          title: "workflow.detail_story.attachments.deleted_attachment",
          translocoTitleParams: { var: storyAttachment.name },
        });
      });
  }
}
