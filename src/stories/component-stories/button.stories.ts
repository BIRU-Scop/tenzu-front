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

import { CommonModule } from "@angular/common";
import { withTransloco } from "../storybook-providers";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";

type Story = StoryObj<ButtonComponent>;

const meta: Meta<ButtonComponent> = {
  component: ButtonComponent,
  title: "Components/Button",
  decorators: [
    withTransloco,
    moduleMetadata({
      imports: [CommonModule],
    }),
  ],
};

export const PrimaryButton: Story = {
  render: (args) => ({
    props: args,
    template: `
  <div class="flex flex-col gap-4">
  <h1>primary</h1>
    <div class="flex flex-wrap gap-4 items-center">
       <app-button [iconName]="'add'" [level]="'primary'" [translocoKey]="'button.primary'"/>
       <app-button [iconName]="'add'" [level]="'primary'" [disabled]="true" [translocoKey]="'button.primary.disabled'"/>
       <app-button [iconName]="'add'" [level]="'primary'" [iconOnly]="true" [translocoKey]="'button.primary.icon'"/>
       <app-button [iconName]="'add'" [level]="'primary'" [iconOnly]="true" [iconNoBackground]="true" [translocoKey]="'button.primary.icon-no-bg'"/>
       <app-button [iconName]="'add'" [level]="'primary'" [iconOnly]="true" [disabled]="true" [translocoKey]="'button.primary.icon.disabled'"/>
       <app-button  [iconName]="'add'" [level]="'primary'" [iconOnly]="true" [iconSize]="'sm'" [translocoKey]="'button.primary.icon.sm'"/>
       <app-button  [iconName]="'add'" [level]="'primary'" [iconOnly]="true" [iconSize]="'md'" [translocoKey]="'button.primary.icon.md'"/>
       <app-button  [iconName]="'add'" [level]="'primary'" [iconOnly]="true" [iconSize]="'lg'" [translocoKey]="'button.primary.icon.lg'"/>
       <app-button  [iconName]="'add'" [level]="'primary'" [iconOnly]="true" [iconSize]="'xl'" [translocoKey]="'button.primary.icon.xl'"/>
    </div>
    <h1>secondary</h1>
    <div class="flex flex-wrap gap-4 items-center">
       <app-button [iconName]="'add'" [level]="'secondary'" [translocoKey]="'button.secondary'"/>
       <app-button [iconName]="'add'" [level]="'secondary'" [disabled]="true" [translocoKey]="'button.secondary.disabled'"/>
       <app-button [iconName]="'add'" [level]="'secondary'" [iconOnly]="true" [translocoKey]="'button.secondary.icon'"/>
       <app-button [iconName]="'add'" [level]="'secondary'" [iconOnly]="true" [iconNoBackground]="true" [translocoKey]="'button.secondary.icon-no-bg'"/>
       <app-button [iconName]="'add'" [level]="'secondary'" [iconOnly]="true" [disabled]="true" [translocoKey]="'button.secondary.icon.disabled'"/>
       <app-button [iconName]="'add'" [level]="'secondary'" [iconOnly]="true" [iconSize]="'sm'" [translocoKey]="'button.secondary.icon.sm'"/>
       <app-button [iconName]="'add'" [level]="'secondary'" [iconOnly]="true" [iconSize]="'md'" [translocoKey]="'button.secondary.icon.md'"/>
       <app-button [iconName]="'add'" [level]="'secondary'" [iconOnly]="true" [iconSize]="'lg'" [translocoKey]="'button.secondary.icon.lg'"/>
       <app-button [iconName]="'add'" [level]="'secondary'" [iconOnly]="true" [iconSize]="'xl'" [translocoKey]="'button.secondary.icon.xl'"/>
    </div>
    <h1>tertiary</h1>
    <div class="flex flex-wrap gap-4 items-center">
     <app-button [iconName]="'add'" [level]="'tertiary'" [translocoKey]="'button.tertiary'"/>
     <app-button [iconName]="'add'" [level]="'tertiary'" [disabled]="true" [translocoKey]="'button.tertiary.disabled'"/>
     <app-button [iconName]="'add'" [level]="'tertiary'" [iconOnly]="true" [translocoKey]="'button.tertiary.icon'"/>
     <app-button [iconName]="'add'" [level]="'tertiary'" [iconOnly]="true" [iconNoBackground]="true" [translocoKey]="'button.tertiary.icon-no-bg'"/>
     <app-button [iconName]="'add'" [level]="'tertiary'" [iconOnly]="true" [disabled]="true" [translocoKey]="'button.tertiary.icon.disabled'"/>
     <app-button [iconName]="'add'" [level]="'tertiary'" [iconOnly]="true" [iconSize]="'sm'" [translocoKey]="'button.tertiary.icon.sm'"/>
     <app-button [iconName]="'add'" [level]="'tertiary'" [iconOnly]="true" [iconSize]="'md'" [translocoKey]="'button.tertiary.icon.md'"/>
     <app-button [iconName]="'add'" [level]="'tertiary'" [iconOnly]="true" [iconSize]="'lg'" [translocoKey]="'button.tertiary.icon.lg'"/>
     <app-button [iconName]="'add'" [level]="'tertiary'" [iconOnly]="true" [iconSize]="'xl'" [translocoKey]="'button.tertiary.icon.xl'"/>
    </div>
    <h1>warning</h1>
    <div class="flex flex-wrap gap-4 items-center">
     <app-button [iconName]="'add'" [level]="'warning'" [translocoKey]="'button.warning'"/>
     <app-button [iconName]="'add'" [level]="'warning'" [disabled]="true" [translocoKey]="'button.warning.disabled'"/>
     <app-button [iconName]="'add'" [level]="'warning'" [iconOnly]="true" [translocoKey]="'button.warning.icon'"/>
     <app-button [iconName]="'add'" [level]="'warning'" [iconOnly]="true" [iconNoBackground]="true" [translocoKey]="'button.warning.icon-no-bg'"/>
     <app-button [iconName]="'add'" [level]="'warning'" [iconOnly]="true" [disabled]="true" [translocoKey]="'button.warning.icon.disabled'"/>
     <app-button [iconName]="'add'" [level]="'warning'" [iconOnly]="true" [iconSize]="'sm'" [translocoKey]="'button.warning.icon.sm'"/>
     <app-button [iconName]="'add'" [level]="'warning'" [iconOnly]="true" [iconSize]="'md'" [translocoKey]="'button.warning.icon.md'"/>
     <app-button [iconName]="'add'" [level]="'warning'" [iconOnly]="true" [iconSize]="'lg'" [translocoKey]="'button.warning.icon.lg'"/>
     <app-button [iconName]="'add'" [level]="'warning'" [iconOnly]="true" [iconSize]="'xl'" [translocoKey]="'button.warning.icon.xl'"/>
    </div>
    <h1>error</h1>
    <div class="flex flex-wrap gap-4 items-center">
       <app-button [iconName]="'add'" [level]="'error'" [translocoKey]="'button.error'"/>
       <app-button [iconName]="'add'" [level]="'error'" [disabled]="true" [translocoKey]="'button.error.disabled'"/>
       <app-button [iconName]="'add'" [level]="'error'" [iconOnly]="true" [translocoKey]="'button.error.icon'"/>
       <app-button [iconName]="'add'" [level]="'error'" [iconOnly]="true" [iconNoBackground]="true" [translocoKey]="'button.error.icon-no-bg'"/>
       <app-button [iconName]="'add'" [level]="'error'" [iconOnly]="true" [disabled]="true" [translocoKey]="'button.error.icon.disabled'"/>
       <app-button [iconName]="'add'" [level]="'error'" [iconOnly]="true" [iconSize]="'sm'" [translocoKey]="'button.error.icon.sm'"/>
       <app-button [iconName]="'add'" [level]="'error'" [iconOnly]="true" [iconSize]="'md'" [translocoKey]="'button.error.icon.md'"/>
       <app-button [iconName]="'add'" [level]="'error'" [iconOnly]="true" [iconSize]="'lg'" [translocoKey]="'button.error.icon.lg'"/>
       <app-button [iconName]="'add'" [level]="'error'" [iconOnly]="true" [iconSize]="'xl'" [translocoKey]="'button.error.icon.xl'"/>
    </div>
    <h1>success</h1>
    <div class="flex flex-wrap gap-4 items-center">
       <app-button [iconName]="'add'" [level]="'success'" [translocoKey]="'button.success'"/>
       <app-button [iconName]="'add'" [level]="'success'"   [disabled]="true" [translocoKey]="'button.success.disabled'"/>
       <app-button [iconName]="'add'" [level]="'success'"  [iconOnly]="true" [translocoKey]="'button.success.icon'"/>
       <app-button [iconName]="'add'" [level]="'success'"  [iconOnly]="true" [iconNoBackground]="true" [translocoKey]="'button.success.icon-no-bg'"/>
       <app-button [iconName]="'add'" [level]="'success'"  [iconOnly]="true" [disabled]="true" [translocoKey]="'button.success.icon.disabled'"/>
       <app-button [iconName]="'add'" [level]="'success'" [iconOnly]="true" [iconSize]="'sm'" [translocoKey]="'button.success.icon.sm'"/>
       <app-button [iconName]="'add'" [level]="'success'" [iconOnly]="true" [iconSize]="'md'" [translocoKey]="'button.success.icon.md'"/>
       <app-button [iconName]="'add'" [level]="'success'" [iconOnly]="true" [iconSize]="'lg'" [translocoKey]="'button.success.icon.lg'"/>
       <app-button [iconName]="'add'" [level]="'success'" [iconOnly]="true" [iconSize]="'xl'" [translocoKey]="'button.success.icon.xl'"/>
    </div>
    </div>
`,
  }),
};

export default meta;
