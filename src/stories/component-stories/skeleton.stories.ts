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

import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import { Component } from "@angular/core";
import { withTransloco } from "../storybook-providers";
import { StatusSkeletonComponent } from "../../app/workspace/project-detail/project-kanban-skeleton/status-skeleton/status-skeleton.component";
import { StorySkeletonComponent } from "../../app/workspace/project-detail/project-kanban-skeleton/story-skeleton/story-skeleton.component";
import { ProjectKanbanSkeletonComponent } from "../../app/workspace/project-detail/project-kanban-skeleton/project-kanban-skeleton.component";
import { CardSkeletonComponent } from "@tenzu/shared/components/skeletons/card-skeleton/card-skeleton.component";
import { WorkspaceSkeletonComponent } from "../../app/workspace/workspace-list/workspace-skeleton/workspace-skeleton.component";
import { StoryCommentSkeletonComponent } from "../../app/workspace/project-detail/kanban-wrapper/story-detail/story-detail-panel-left/story-detail-comments-list/story-detail-comment-detail/story-comment-skeleton.component";

@Component({
  selector: "app-skeleton-storybook",
  standalone: true,
  imports: [
    StatusSkeletonComponent,
    StorySkeletonComponent,
    CardSkeletonComponent,
    WorkspaceSkeletonComponent,
    StoryCommentSkeletonComponent,
    ProjectKanbanSkeletonComponent,
  ],
  template: `
    <div class="flex flex-col gap-12">
      <section class="flex flex-col gap-4">
        <h1>Status skeleton</h1>
        <div class="w-64">
          <app-status-skeleton />
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h1>Story skeleton</h1>
        <div class="w-64">
          <app-story-skeleton />
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h1>Card skeleton</h1>
        <div class="w-96">
          <app-card-skeleton />
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h1>Workspace skeleton</h1>
        <div class="w-[480px]">
          <app-workspace-skeleton />
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h1>Story comment skeleton</h1>
        <div class="w-[480px]">
          <app-story-comment-skeleton />
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h1>Project kanban skeleton (composition)</h1>
        <app-project-kanban-skeleton />
      </section>
    </div>
  `,
})
class StorySkeletonStorybookComponent {}

type Story = StoryObj<StorySkeletonStorybookComponent>;

const meta: Meta<StorySkeletonStorybookComponent> = {
  component: StorySkeletonStorybookComponent,
  title: "Components/Skeleton",
  decorators: [withTransloco, moduleMetadata({})],
};

export default meta;

export const Compositions: Story = {
  render: (args) => ({
    props: args,
    template: `<app-skeleton-storybook />`,
  }),
};
