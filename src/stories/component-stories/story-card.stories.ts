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
import { Component, importProvidersFrom, inject, OnInit, provideEnvironmentInitializer } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { provideRouter } from "@angular/router";
import { provideTranslocoScope } from "@jsverse/transloco";
import { JwtModule } from "@auth0/angular-jwt";
import { StoryCardComponent } from "../../app/workspace/project-detail/kanban-wrapper/project-kanban/story-card/story-card.component";
import { ProjectMembershipEntitiesStore } from "@tenzu/repository/project-membership";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { withTransloco } from "../storybook-providers";
import { withDevToolsStub } from "@angular-architects/ngrx-toolkit";

const members = [
  {
    id: "m1",
    projectId: "p1",
    roleId: "r1",
    user: { id: "u1", username: "ggray", fullName: "Gigi Gray", color: 1, email: "gigi@example.com" },
  },
  {
    id: "m2",
    projectId: "p1",
    roleId: "r1",
    user: { id: "u2", username: "ayilmaz", fullName: "Ayla Yilmaz", color: 3, email: "ayla@example.com" },
  },
  {
    id: "m3",
    projectId: "p1",
    roleId: "r1",
    user: { id: "u3", username: "bmartin", fullName: "Bea Martin", color: 2, email: "bea@example.com" },
  },
  {
    id: "m4",
    projectId: "p1",
    roleId: "r1",
    user: { id: "u4", username: "cdupont", fullName: "Cyril Dupont", color: 4, email: "cyril@example.com" },
  },
];

@Component({
  selector: "app-story-card-storybook",
  standalone: true,
  imports: [StoryCardComponent],
  template: `
    <div class="flex flex-col gap-12">
      <section class="flex flex-col gap-4">
        <h1>Default — title on 2 lines, two assignees</h1>
        <ul class="flex flex-row flex-wrap gap-4 items-start">
          <li class="w-60 h-[102px]">
            <app-story-card class="block w-56" [story]="twoLineStory" [hasModifyPermission]="true" />
          </li>
        </ul>
      </section>

      <section class="flex flex-col gap-4">
        <h1>Title length</h1>
        <ul class="flex flex-row flex-wrap gap-4 items-start">
          <li class="w-60 h-[102px]">
            <app-story-card class="block w-56" [story]="shortStory" [hasModifyPermission]="true" />
          </li>
          <li class="w-60 h-[102px]">
            <app-story-card class="block w-56" [story]="twoLineStory" [hasModifyPermission]="true" />
          </li>
          <li class="w-60 h-[102px]">
            <app-story-card class="block w-56" [story]="longStory" [hasModifyPermission]="true" />
          </li>
        </ul>
      </section>

      <section class="flex flex-col gap-4">
        <h1>Assignees — variations</h1>
        <ul class="flex flex-row flex-wrap gap-4 items-start">
          <li class="w-60 h-[102px]">
            <app-story-card class="block w-56" [story]="oneAssigneeStory" [hasModifyPermission]="true" />
          </li>
          <li class="w-60 h-[102px]">
            <app-story-card class="block w-56" [story]="manyAssigneesStory" [hasModifyPermission]="true" />
          </li>
        </ul>
      </section>

      <section class="flex flex-col gap-4">
        <h1>No assignees</h1>
        <div class="flex flex-row flex-wrap gap-8 items-start">
          <div class="flex flex-col gap-2">
            <h2 class="text-sm">With modify permission</h2>
            <div class="w-60 h-[102px]">
              <app-story-card class="block w-56" [story]="noAssigneeStory" [hasModifyPermission]="true" />
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <h2 class="text-sm">Read-only</h2>
            <div class="w-60 h-[102px]">
              <app-story-card class="block w-56" [story]="noAssigneeStory" [hasModifyPermission]="false" />
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
})
class StoryStoryCardStorybookComponent implements OnInit {
  private readonly membershipStore = inject(ProjectMembershipEntitiesStore);

  readonly shortStory = { ref: 12, title: "Short title", projectId: "p1", assigneeIds: ["u1"] };
  readonly twoLineStory = {
    ref: 235,
    title: "Card User story sur 2 lignes",
    projectId: "p1",
    assigneeIds: ["u1", "u2"],
  };
  readonly longStory = {
    ref: 999,
    title:
      "A very long story title that will be clamped to two visible lines and the rest gets truncated with an ellipsis",
    projectId: "p1",
    assigneeIds: ["u1", "u2"],
  };
  readonly oneAssigneeStory = { ref: 42, title: "Single assignee story", projectId: "p1", assigneeIds: ["u1"] };
  readonly manyAssigneesStory = {
    ref: 88,
    title: "Many assignees story",
    projectId: "p1",
    assigneeIds: ["u1", "u2", "u3", "u4"],
  };
  readonly noAssigneeStory = { ref: 7, title: "No assignees yet", projectId: "p1", assigneeIds: [] };

  ngOnInit() {
    this.membershipStore.setAllEntities(members);
  }
}

type Story = StoryObj<StoryStoryCardStorybookComponent>;

const meta: Meta<StoryStoryCardStorybookComponent> = {
  component: StoryStoryCardStorybookComponent,
  title: "Components/StoryCard",
  decorators: [
    withTransloco,
    moduleMetadata({}),
    applicationConfig({
      providers: [
        provideHttpClient(),
        provideRouter([{ path: "**", children: [] }]),
        provideTranslocoScope("workflow"),
        importProvidersFrom(
          JwtModule.forRoot({
            config: { tokenGetter: () => null, allowedDomains: ["localhost"] },
          }),
        ),
        provideEnvironmentInitializer(() => {
          inject(ConfigAppService).config.set({
            env: "dev",
            storeWithDevTools: withDevToolsStub,
            debug: false,
            wsUrl: "ws://localhost",
            api: { scheme: "http", baseDomain: "localhost", suffixDomain: "api", prefix: "v1" },
            maxUploadFileSize: 100 * 1024 * 1024,
            avatars: { maxUploadFileSize: 500 * 1024, allowedFormats: [".jpg", ".png", ".gif", ".webp"] },
            legal: null,
            security: { password: { minLength: 8, numberDiversityDifference: 3, lengthSecureThreshold: 12 } },
            sentry: {},
            appVersion: "0.0.0-storybook",
          });
        }),
      ],
    }),
  ],
};

export default meta;

export const Compositions: Story = {
  render: (args) => ({
    props: args,
    template: `<app-story-card-storybook />`,
  }),
};
