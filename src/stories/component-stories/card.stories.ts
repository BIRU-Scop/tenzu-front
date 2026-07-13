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
import { Component } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { provideRouter } from "@angular/router";
import { ProjectCardComponent } from "@tenzu/shared/components/project-card/project-card.component";
import { withTransloco } from "../storybook-providers";

@Component({
  selector: "app-card-storybook",
  standalone: true,
  imports: [ProjectCardComponent],
  template: `
    <div class="flex flex-col gap-12">
      <section class="flex flex-col gap-4">
        <h1>Default — name, description & link</h1>
        <div class="flex flex-row flex-wrap gap-4 items-start">
          <app-project-card
            workspaceId="ws-1"
            name="Short"
            [color]="3"
            description="One line."
            landingPage="/projects/1"
          />
          <app-project-card
            workspaceId="ws-1"
            name="Two Lines"
            [color]="1"
            description="Two short lines of description text here."
            landingPage="/projects/1"
          />
          <app-project-card
            workspaceId="ws-1"
            name="Card Project"
            [color]="2"
            description="description xxxxx xxxxxxx xxxx xxxxxxx xxxxx xxxxxxxx"
            landingPage="/projects/1"
          />
          <app-project-card
            workspaceId="ws-1"
            name="Overflow"
            [color]="4"
            description="A much longer description that will absolutely overflow three lines and should be clipped by line-clamp at the end of the third visible line."
            landingPage="/projects/1"
          />
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h1>Without description</h1>
        <div class="flex flex-row flex-wrap gap-4">
          <app-project-card workspaceId="ws-1" name="Marketing Site" [color]="1" landingPage="/projects/2" />
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h1>Without link (read-only)</h1>
        <div class="flex flex-row flex-wrap gap-4">
          <app-project-card
            workspaceId="ws-1"
            name="Archived Project"
            [color]="0"
            description="This project is archived and cannot be opened."
          />
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h1>Color variants</h1>
        <div class="flex flex-row flex-wrap gap-4">
          @for (item of colorVariants; track item.color) {
            <app-project-card
              workspaceId="ws-1"
              [name]="item.name"
              [color]="item.color"
              [description]="item.description"
              landingPage="/projects/{{ item.color }}"
            />
          }
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h1>Empty state — create first project</h1>
        <div class="flex flex-row flex-wrap gap-4">
          <app-project-card workspaceId="ws-1" />
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h1>Disabled (locked)</h1>
        <div class="flex flex-row flex-wrap gap-4">
          <app-project-card
            workspaceId="ws-1"
            name="Private Project"
            [color]="4"
            description="You don't have access to this project."
            [disabled]="true"
          />
        </div>
      </section>
    </div>
  `,
})
class StoryCardStorybookComponent {
  readonly colorVariants = [
    { name: "Alpha Project", color: 1, description: "Primary container palette." },
    { name: "Beta Project", color: 2, description: "Warning container palette." },
    { name: "Gamma Project", color: 3, description: "Tertiary container palette." },
    { name: "Delta Project", color: 4, description: "Error container palette." },
  ];
}

type Story = StoryObj<StoryCardStorybookComponent>;

const meta: Meta<StoryCardStorybookComponent> = {
  component: StoryCardStorybookComponent,
  title: "Components/Card",
  decorators: [
    withTransloco,
    moduleMetadata({}),
    applicationConfig({
      providers: [provideHttpClient(), provideRouter([{ path: "**", children: [] }])],
    }),
  ],
};

export default meta;

export const Compositions: Story = {
  render: (args) => ({
    props: args,
    template: `<app-card-storybook />`,
  }),
};
