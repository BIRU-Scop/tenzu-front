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

import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { HasPermissionDirective } from "@tenzu/directives/permission.directive";
import { MatDivider } from "@angular/material/list";

import { ProjectPermissions } from "@tenzu/repository/permission/permission.model";
import { hasEntityRequiredPermission } from "@tenzu/repository/permission/permission.service";
import { ProjectDetail } from "@tenzu/repository/project";
import { StoryDetail } from "@tenzu/repository/story";

import { UserStore } from "@tenzu/repository/user";

import { StoryEditionComponent } from "./story-edition/story-edition.component";
import { StoryDetailCommentsListComponent } from "./story-detail-comments-list/story-detail-comments-list.component";

@Component({
  selector: "app-story-detail-panel-left",
  imports: [HasPermissionDirective, MatDivider, StoryDetailCommentsListComponent, StoryEditionComponent],
  template: `
    @let _story = story();
    @let _user = user();
    @let _project = project();
    @if (_user) {
      <app-story-edition [project]="_project" [story]="_story" [user]="_user" />
    }
    <mat-divider class="!my-4" />
    <app-story-detail-comments-list
      *appHasPermission="{
        actualEntity: _project,
        requiredPermission: ProjectPermissions.VIEW_COMMENT,
      }"
      class="pb-4"
      [projectDetail]="_project"
      [storyDetail]="_story"
    />
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryDetailPanelLeftComponent {
  protected readonly ProjectPermissions = ProjectPermissions;
  project = input.required<ProjectDetail>();
  story = input.required<StoryDetail>();

  user = inject(UserStore).myUser;

  hasModifyPermission = computed(() =>
    hasEntityRequiredPermission({
      requiredPermission: ProjectPermissions.MODIFY_STORY,
      actualEntity: this.project(),
    }),
  );
}
