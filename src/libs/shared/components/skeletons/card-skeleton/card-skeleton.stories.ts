/*
 * Copyright (C) 2024 BIRU
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
import { CardSkeletonComponent } from "./card-skeleton.component";

const meta: Meta<CardSkeletonComponent> = {
  title: "Components/Skeletons/CardSkeleton",
  component: CardSkeletonComponent,
  render: (args: CardSkeletonComponent) => ({
    props: {
      ...args,
    },
    template: `<app-card-skeleton ${argsToTemplate(args)}></app-card-skeleton>`,
  }),
};

export default meta;
type Story = StoryObj<CardSkeletonComponent>;

export const Default: Story = {
  args: {},
};
