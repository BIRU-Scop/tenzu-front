/*
 * Copyright (C) 2024-2025 BIRU
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

import type { Meta, StoryObj } from "@storybook/angular";
import { argsToTemplate } from "@storybook/angular";
import { StorySkeletonComponent } from "../../app/workspace/project-detail/project-kanban-skeleton/story-skeleton/story-skeleton.component";

const meta: Meta<StorySkeletonComponent> = {
  title: "Components/Skeletons/Workflow/StorySkeleton",
  component: StorySkeletonComponent,
  render: (args: StorySkeletonComponent) => ({
    props: {
      ...args,
    },
    template: `<app-story-skeleton ${argsToTemplate(args)}></app-story-skeleton>`,
  }),
};

export default meta;
type Story = StoryObj<StorySkeletonComponent>;

export const Default: Story = {
  args: {},
};
