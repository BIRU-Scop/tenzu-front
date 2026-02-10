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

import { ChangeDetectionStrategy, Component, inject, input, linkedSignal } from "@angular/core";
import { MatFormField, MatOption, MatSelect } from "@angular/material/select";
import { WorkflowRepositoryService } from "src/libs/repository/workflow";
import { StoryDetail, StoryRepositoryService } from "src/libs/repository/story";
import { NotificationService } from "src/libs/utils/services/notification";
import { StatusSummary } from "src/libs/repository/status";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: "app-story-status",
  imports: [MatOption, MatSelect, MatFormField, TranslocoDirective],
  host: { class: "flex flex-row items-center" },
  template: `
    <ng-container *transloco="let t">
      <div class="text-on-surface-variant mat-label-medium basis-24">{{ t("workflow.detail_story.status") }}</div>
      <mat-form-field class="w-52 self-center" [subscriptSizing]="'dynamic'">
        <mat-select
          [(value)]="this.statusSelected"
          (selectionChange)="changeStatus($event.value, storyDetail())"
          [disabled]="!hasModifyPermission()"
        >
          @for (status of workflowRepositoryService.statuses(); track status.id) {
            <mat-option [value]="status.id">{{ status.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryStatusComponent {
  workflowRepositoryService = inject(WorkflowRepositoryService);
  storyRepositoryService = inject(StoryRepositoryService);
  notificationService = inject(NotificationService);

  storyDetail = input.required<StoryDetail>();
  hasModifyPermission = input(false);
  statusSelected = linkedSignal(() => this.storyDetail().statusId);

  async changeStatus(statusId: StatusSummary["id"], storyDetail: StoryDetail) {
    await this.storyRepositoryService.patchRequest(
      storyDetail.ref,
      {
        statusId: statusId,
        version: storyDetail.version,
      },
      { projectId: storyDetail.projectId, ref: storyDetail.ref },
    );
    this.storyRepositoryService.reorder();
    this.notificationService.success({ title: "notification.action.changes_saved" });
  }
}
