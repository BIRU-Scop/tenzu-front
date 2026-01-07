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

import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { DatePipe } from "@angular/common";
import { MatDivider } from "@angular/material/list";
import { StoryDetailAttachmentsComponent } from "./story-detail-attachments/story-detail-attachments.component";
import { StoryStatusComponent } from "./story-status/story-status.component";
import { TranslocoDirective } from "@jsverse/transloco";
import { ButtonDeleteComponent } from "@tenzu/shared/components/ui/button/button-delete.component";
import { ConfirmDirective } from "@tenzu/directives/confirm";
import { HasPermissionDirective } from "@tenzu/directives/permission.directive";
import { StoryAssigneeComponent } from "@tenzu/shared/components/story-assignee/story-assignee.component";
import { UserCardComponent } from "@tenzu/shared/components/user-card";
import { StoryDetail } from "@tenzu/repository/story";
import { ProjectDetail } from "@tenzu/repository/project";
import { ProjectPermissions } from "@tenzu/repository/permission/permission.model";

@Component({
  selector: "app-story-detail-panel-right",
  imports: [
    ButtonDeleteComponent,
    ConfirmDirective,
    DatePipe,
    HasPermissionDirective,
    MatDivider,
    StoryAssigneeComponent,
    StoryDetailAttachmentsComponent,
    StoryStatusComponent,
    UserCardComponent,
    TranslocoDirective,
  ],
  host: { class: "flex flex-col gap-4" },
  template: `
    @let _project = project();
    @let _story = story();
    <ng-container *transloco="let t; prefix: 'workflow.detail_story'">
      <div class="flex flex-col gap-4 content-start mb-2">
        <div class="flex flex-row">
          <div class="text-on-surface-variant mat-label-medium self-center basis-24">{{ t("created_by") }}</div>
          <app-user-card
            [fullName]="_story.createdBy?.fullName || t('former_user')"
            [avatarName]="_story.createdBy?.fullName || ''"
            [subtext]="_story.createdAt | date: 'short'"
            [color]="_story.createdBy?.color || 0"
          />
        </div>
        <app-story-status [storyDetail]="_story" [hasModifyPermission]="hasModifyPermission()" />
        <div class="flex flex-row">
          <span class="text-on-surface-variant mat-label-medium self-center basis-24">{{ t("assigned_to") }}</span>
          <app-story-assignee
            [story]="_story"
            [hasModifyPermission]="hasModifyPermission()"
            [config]="{ relativeXPosition: 'left' }"
          />
        </div>
      </div>
      <mat-divider />
      <ng-container
        *appHasPermission="{
          actualEntity: _project,
          requiredPermission: ProjectPermissions.DELETE_STORY,
        }"
      >
        <app-button-delete
          [translocoKey]="'workflow.detail_story.delete_story'"
          [iconOnly]="true"
          appConfirm
          [data]="{
            deleteAction: true,
            title: t('confirm_delete_story'),
            message: t('confirm_delete_story_message'),
          }"
          (popupConfirm)="deleteStory.emit()"
        />
        <mat-divider />

        <app-story-detail-attachments
          [projectDetail]="_project"
          [storyDetail]="_story"
          [hasModifyPermission]="hasModifyPermission()"
        />
      </ng-container>
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryDetailPanelRightComponent {
  story = input.required<StoryDetail>();
  project = input.required<ProjectDetail>();
  hasModifyPermission = input.required<boolean>();
  deleteStory = output<void>();
  protected readonly ProjectPermissions = ProjectPermissions;
}
