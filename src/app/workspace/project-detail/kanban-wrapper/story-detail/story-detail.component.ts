/*
 * Copyright (C) 2024-2026 BIRU
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

import { ChangeDetectionStrategy, Component, computed, inject, input, output } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { toObservable } from "@angular/core/rxjs-interop";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatTableModule } from "@angular/material/table";
import { StoryDetailFacade } from "./story-detail.facade";
import { NotificationService } from "@tenzu/utils/services/notification";
import { filterNotNull } from "@tenzu/utils/functions/rxjs.operators";
import { StoryDetailMenuComponent } from "./story-detail-menu/story-detail-menu.component";
import { ProjectRepositoryService } from "@tenzu/repository/project";
import { HasPermissionDirective } from "@tenzu/directives/permission.directive";
import { ProjectPermissions } from "@tenzu/repository/permission/permission.model";
import { hasEntityRequiredPermission } from "@tenzu/repository/permission/permission.service";
import { StoryDetailPanelRightComponent } from "./story-detail-panel-right/story-detail-panel-right.component";
import { StoryDetailPanelLeftComponent } from "./story-detail-panel-left/story-detail-panel-left.component";
import { MatDivider } from "@angular/material/list";

@Component({
  selector: "app-story-detail",
  imports: [
    ReactiveFormsModule,
    MatExpansionModule,
    MatTableModule,
    StoryDetailMenuComponent,
    HasPermissionDirective,
    StoryDetailPanelRightComponent,
    StoryDetailPanelLeftComponent,
    MatDivider,
  ],

  template: `
    @let project = projectRepositoryService.entityDetail();
    @let story = selectedStory();
    @if (project && story) {
      <ng-container
        *appHasPermission="{
          actualEntity: project,
          requiredPermission: ProjectPermissions.VIEW_STORY,
        }"
      >
        <app-story-detail-menu
          [story]="story"
          [canBeClosed]="canBeClosed()"
          [hasModifyPermission]="hasModifyPermission()"
          (closed)="closed.emit()"
        />
        <div class="flex flex-row gap-4 h-5/6">
          <app-story-detail-panel-left
            class="basis-1/2 lg:basis-2/3 flex flex-col p-4 min-w-0 gap-4"
            [story]="story"
            [project]="project"
          />
          <mat-divider [vertical]="true" />
          <app-story-detail-panel-right
            class="basis-1/2 lg:basis-1/3 flex-1 min-w-0  h-full pt-4"
            [project]="project"
            [story]="story"
            [hasModifyPermission]="hasModifyPermission()"
            (deleteStory)="onDelete()"
          />
        </div>
      </ng-container>
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StoryDetailComponent {
  protected readonly ProjectPermissions = ProjectPermissions;
  storyDetailFacade = inject(StoryDetailFacade);
  workflowService = this.storyDetailFacade.workflowRepositoryService;
  projectRepositoryService = inject(ProjectRepositoryService);
  storyService = this.storyDetailFacade.storyRepositoryService;
  notificationService = inject(NotificationService);

  hasModifyPermission = computed(() => {
    const project = this.projectRepositoryService.entityDetail();
    return project
      ? hasEntityRequiredPermission({
          requiredPermission: ProjectPermissions.MODIFY_STORY,
          actualEntity: project,
        })
      : false;
  });
  canBeClosed = input(false);
  closed = output<void>();
  selectedStory = this.storyService.entityDetail;

  constructor() {
    toObservable(this.selectedStory)
      .pipe(filterNotNull())
      .subscribe(async (value) => {
        if (this.workflowService.entityDetail()?.id !== value.workflowId) {
          await this.workflowService.getBySlugRequest(value.workflow);
        }
      });
  }

  async onDelete() {
    await this.storyDetailFacade.deleteSelectedStory();
    this.closed.emit();
  }
}
