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
import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { provideRouter } from "@angular/router";
import { PrimarySideNavComponent } from "@tenzu/shared/components/primary-side-nav/primary-side-nav.component";
import { SideNavStore } from "@tenzu/repository/sidenav";
import { withTransloco } from "../storybook-providers";

@Component({
  selector: "app-primary-side-nav-storybook",
  standalone: true,
  imports: [PrimarySideNavComponent],
  host: { style: "display: block; height: 100vh;" },
  styles: `
    :host ::ng-deep mat-sidenav-container,
    :host ::ng-deep mat-sidenav {
      height: 100%;
    }
  `,
  template: `
    <app-primary-side-nav>
      <div class="p-4">
        <h1>Main content</h1>
        <p>Side-nav demo content. Use the collapse button at the bottom to toggle the resized state.</p>
      </div>
    </app-primary-side-nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StoryPrimarySideNavStorybookComponent implements OnInit {
  private readonly sideNavStore = inject(SideNavStore);

  ngOnInit() {
    this.sideNavStore.setAvatar({
      type: "Workspace",
      name: "Acme Inc",
      color: 1,
    });
    this.sideNavStore.setPrimaryNavItems([
      { label: "Projects", iconName: "lists", href: "/projects", testId: "projects-link" },
      { label: "Activity", iconName: "bolt", href: "/activity", testId: "activity-link" },
    ]);
    this.sideNavStore.setSecondaryNavItems([
      { label: "Members", iconName: "group", href: "/members", testId: "members-link" },
      { label: "Settings", iconName: "settings", href: "/settings", testId: "settings-link" },
    ]);
  }
}

type Story = StoryObj<StoryPrimarySideNavStorybookComponent>;

const meta: Meta<StoryPrimarySideNavStorybookComponent> = {
  component: StoryPrimarySideNavStorybookComponent,
  title: "Components/PrimarySideNav",
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, iframeHeight: 720 },
    },
  },
  decorators: [
    withTransloco,
    applicationConfig({
      providers: [
        provideRouter([
          { path: "projects", children: [] },
          { path: "activity", children: [] },
          { path: "members", children: [] },
          { path: "settings", children: [] },
          { path: "**", redirectTo: "projects" },
        ]),
      ],
    }),
    moduleMetadata({}),
  ],
};

export default meta;

export const Compositions: Story = {
  render: (args) => ({
    props: args,
    template: `<app-primary-side-nav-storybook />`,
  }),
};
