/*
 * Copyright (C) 2025 BIRU
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
import { DatePipe } from "@angular/common";
import { MatButton, MatIconButton } from "@angular/material/button";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from "@angular/material/table";
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from "@angular/material/expansion";
import { TranslocoDirective } from "@jsverse/transloco";
import { StoryAttachment, StoryAttachmentRepositoryService } from "@tenzu/repository/story-attachment";
import { StoryDetail } from "@tenzu/repository/story";
import { ProjectDetail } from "@tenzu/repository/project";
import { NotificationService } from "@tenzu/utils/services/notification";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "app-story-detail-attachments",
  imports: [
    DatePipe,
    MatButton,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    TranslocoDirective,
    MatIcon,
    MatTable,
    MatHeaderCell,
    MatHeaderCellDef,
    MatIconButton,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatIcon,
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
          <mat-table [dataSource]="selectedStoryAttachments">
            <ng-container matColumnDef="name">
              <mat-header-cell *matHeaderCellDef>{{ t("attachments.name") }}</mat-header-cell>
              <mat-cell *matCellDef="let row"> {{ row.name }}</mat-cell>
            </ng-container>

            <ng-container matColumnDef="size">
              <mat-header-cell *matHeaderCellDef>{{ t("attachments.size") }}</mat-header-cell>
              <mat-cell *matCellDef="let row"> {{ row.size }}</mat-cell>
            </ng-container>

            <ng-container matColumnDef="date">
              <mat-header-cell *matHeaderCellDef>{{ t("attachments.date") }}</mat-header-cell>
              <mat-cell *matCellDef="let row"> {{ row.createdAt | date: "medium" }}</mat-cell>
            </ng-container>

            <ng-container matColumnDef="actions">
              <mat-header-cell *matHeaderCellDef></mat-header-cell>
              <mat-cell *matCellDef="let row">
                <button mat-icon-button (click)="previewFile(row)" type="button">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button (click)="downloadFile(row)" type="button">
                  <mat-icon>download</mat-icon>
                </button>
                @if (_hasModifyPermission) {
                  <button mat-icon-button type="button" (click)="deleteAttachment(row)">
                    <mat-icon>delete</mat-icon>
                  </button>
                }
              </mat-cell>
            </ng-container>

            <!-- Header and Row Declarations -->
            <mat-header-row *matHeaderRowDef="['name', 'size', 'date', 'actions']"></mat-header-row>
            <mat-row *matRowDef="let row; columns: ['name', 'size', 'date', 'actions']"></mat-row>
          </mat-table>
        </mat-expansion-panel>
      }
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryDetailAttachmentsComponent {
  storyAttachmentRepositoryService = inject(StoryAttachmentRepositoryService);
  notificationService = inject(NotificationService);

  storyDetail = input.required<StoryDetail>();
  projectDetail = input.required<ProjectDetail>();
  hasModifyPermission = input(false);
  constructor() {
    effect(() => {
      this.storyAttachmentRepositoryService.resetAll();
      untracked(() =>
        this.storyAttachmentRepositoryService
          .listRequest({
            projectId: this.storyDetail().projectId,
            ref: this.storyDetail().ref,
          })
          .then(),
      ).then();
    });
  }

  previewFile(row: StoryAttachment) {
    this.storyAttachmentRepositoryService.previewAttachement(row);
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
      // if exceed 100 MB
      if (input.files[0].size > 104857600) {
        this.notificationService.error({
          translocoTitle: true,
          title: "workflow.detail_story.attachments.exceed_size",
          translocoTitleParams: { var: input.files[0].name },
        });
        return;
      }
      this.storyAttachmentRepositoryService
        .createAttachment(input.files[0], { projectId: this.projectDetail().id, ref: data.storyDetail.ref })
        .then();
    }
  }

  deleteAttachment(storyAttachement: StoryAttachment) {
    this.storyAttachmentRepositoryService
      .deleteRequest(storyAttachement, { attachmentId: storyAttachement.id })
      .then(() => {
        this.notificationService.success({
          translocoTitle: true,
          title: "workflow.detail_story.attachments.deleted_attachment",
          translocoTitleParams: { var: storyAttachement.name },
        });
      });
  }
}
