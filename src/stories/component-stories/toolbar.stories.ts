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

import { applicationConfig, Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { MatToolbar } from "@angular/material/toolbar";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { MatIconButton, MatButton } from "@angular/material/button";
import { MatBadge } from "@angular/material/badge";
import { MatDivider } from "@angular/material/divider";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { DomSanitizer } from "@angular/platform-browser";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { withTransloco } from "../storybook-providers";

@Component({
  selector: "app-toolbar-storybook",
  standalone: true,
  imports: [
    MatToolbar,
    MatIcon,
    MatIconButton,
    MatButton,
    MatBadge,
    MatDivider,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    AvatarComponent,
  ],
  template: `
    <div class="flex flex-col gap-12">
      <section class="flex flex-col gap-4">
        <h1>Default — logo, notifications & avatar</h1>
        <mat-toolbar role="banner" class="flex">
          <a class="h-6" href="#" aria-label="Go home">
            <mat-icon class="icon-full" svgIcon="logo-text" />
          </a>
          <span class="grow"></span>
          <button mat-icon-button class="tertiary-button" type="button" aria-label="Notifications">
            <mat-icon [matBadge]="unread()" [matBadgeHidden]="!unread()" aria-hidden="false">notifications</mat-icon>
          </button>
          <mat-divider class="h-1/2 !mx-2" [vertical]="true" />
          <button type="button" [matMenuTriggerFor]="userMenu" aria-label="Open user menu">
            <app-avatar name="Gigi Gray" mode="outlined" size="md" borderColor="#22d3ee" textColor="#27272a" />
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item type="button">
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </button>
            <button mat-menu-item type="button">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </mat-toolbar>
      </section>

      <section class="flex flex-col gap-4">
        <h1>With contextual actions</h1>
        <mat-toolbar role="banner" class="flex">
          <a class="h-6" href="#" aria-label="Go home">
            <mat-icon class="icon-full" svgIcon="logo-text" />
          </a>
          <span class="grow"></span>
          @for (action of actions; track action.label) {
            <button mat-button class="tertiary-button !me-2" type="button">
              <mat-icon>{{ action.icon }}</mat-icon>
              {{ action.label }}
            </button>
          }
          <button mat-icon-button class="tertiary-button" type="button" aria-label="Notifications">
            <mat-icon matBadge="3" aria-hidden="false">notifications</mat-icon>
          </button>
          <mat-divider class="h-1/2 !mx-2" [vertical]="true" />
          <button type="button" aria-label="User avatar">
            <app-avatar
              name="Ayla Yilmaz"
              mode="filled-circle"
              size="md"
              backgroundColor="#7c3aed"
              textColor="#ffffff"
            />
          </button>
        </mat-toolbar>
      </section>

      <section class="flex flex-col gap-4">
        <h1>Logo only</h1>
        <mat-toolbar role="banner" class="flex">
          <a class="h-6" href="#" aria-label="Go home">
            <mat-icon class="icon-full" svgIcon="logo-text" />
          </a>
        </mat-toolbar>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StoryToolbarStorybookComponent {
  private readonly iconRegistry = inject(MatIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);

  readonly unread = signal(2);
  readonly actions = [
    { label: "Save", icon: "save" },
    { label: "Share", icon: "share" },
  ];

  constructor() {
    this.iconRegistry.addSvgIcon("logo-text", this.sanitizer.bypassSecurityTrustResourceUrl("logo-text-tenzu.svg"));
  }
}

type Story = StoryObj<StoryToolbarStorybookComponent>;

const meta: Meta<StoryToolbarStorybookComponent> = {
  component: StoryToolbarStorybookComponent,
  title: "Components/Toolbar",
  decorators: [
    withTransloco,
    moduleMetadata({}),
    applicationConfig({
      providers: [],
    }),
  ],
};

export default meta;

export const Compositions: Story = {
  render: (args) => ({
    props: args,
    template: `<app-toolbar-storybook />`,
  }),
};
