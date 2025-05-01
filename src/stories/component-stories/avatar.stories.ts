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

import { argsToTemplate, Meta, StoryObj } from "@storybook/angular";
import { AvatarComponent } from "../../libs/shared/components/avatar/avatar.component";

const meta: Meta<AvatarComponent> = {
  title: "Components/Avatar",
  component: AvatarComponent,
  // waiting for https://github.com/storybookjs/storybook/issues/28412 to remove manual argTypes
  argTypes: {
    name: { type: "string" },
    rounded: { type: "boolean" },
    color: { type: "number" },
  },
};

export default meta;
type Story = StoryObj<AvatarComponent>;

export const WorkspaceAvatar: Story = {
  args: {
    name: "🐕 Dogs workspace",
    rounded: false,
    size: "sm",
    color: 2,
  },
};

export const ProjectCardAvatar: Story = {
  args: {
    name: "Awesome project",
    rounded: false,
    size: "md",
    color: 1,
  },
};

export const ProjectAvatar: Story = {
  args: {
    name: "Awesome project",
    rounded: false,
    size: "xl",
    color: 4,
  },
};

export const UserAvatar: Story = {
  args: {
    name: "Emeline",
    rounded: true,
    size: "md",
    color: 3,
  },
};

export const ButtonAvatar: Story = {
  args: {
    name: "Emeline",
    rounded: true,
    size: "md",
    color: 3,
  },
  render: (args) => ({
    props: args,
    template: `
    <button><app-avatar ${argsToTemplate(args)}/></button>`,
  }),
};
