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
import { StatusSkeletonComponent } from "../../app/workspace/project-detail/project-kanban-skeleton/status-skeleton/status-skeleton.component";

const meta: Meta<StatusSkeletonComponent> = {
  title: "Components/Skeletons/Workflow/StatusSkeleton",
  component: StatusSkeletonComponent,
  render: (args: StatusSkeletonComponent) => ({
    props: {
      ...args,
    },
    template: `<app-status-skeleton ${argsToTemplate(args)}></app-status-skeleton>`,
  }),
};

export default meta;
type Story = StoryObj<StatusSkeletonComponent>;

export const Default: Story = {
  args: {},
};
