/*
 * Copyright (C) 2026 BIRU
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

import { applicationConfig, Meta, moduleMetadata, StoryObj } from "@storybook/angular-vite";
import { Component, signal } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { provideRouter } from "@angular/router";
import { provideTranslocoScope } from "@jsverse/transloco";
import { ProjectImportationCardComponent } from "@tenzu/shared/components/project-importation-card/project-importation-card.component";
import { ProjectCardComponent } from "@tenzu/shared/components/project-card/project-card.component";
import { ActionCardComponent } from "@tenzu/shared/components/action-card/action-card.component";
import {
  ImportationError,
  ImportationStatus,
  ProjectImportation,
} from "@tenzu/repository/importation/importation.model";
import { makeProjectImportation } from "@tenzu/repository/importation/importation.factories";
import { makeProjectNested } from "@tenzu/repository/project/project.factories";
import { TusUploadCardComponent } from "@tenzu/shared/components/tus-upload-card/tus-upload-card.component";
import { makeTusUploadState } from "@tenzu/repository/importation/tus-upload.factories";
import { TusUploadState } from "@tenzu/repository/importation/tus-upload.model";
import { withTransloco } from "../storybook-providers";
import { MEGABYTE } from "@tenzu/pipes/humanize-file-size";

const project = makeProjectNested({
  name: "Project 1",
  description: "Project 1 for test",
  color: 2,
});

const upload = (overrides: Partial<TusUploadState>): TusUploadState =>
  makeTusUploadState({ fileSize: 100, ...overrides });

@Component({
  selector: "app-project-importation-card-storybook",
  standalone: true,
  imports: [ProjectImportationCardComponent, ProjectCardComponent, ActionCardComponent, TusUploadCardComponent],
  template: `
    <div class="flex flex-col gap-12">
      <section class="flex flex-col gap-4">
        <h1>Upload cards - every status</h1>
        <div class="flex flex-row flex-wrap gap-4 items-start">
          @for (tusUploadState of tusUploadStates; track tusUploadState.id) {
            <app-tus-upload-card
              [tusUploadState]="tusUploadState"
              (paused)="record(tusUploadState, 'paused')"
              (resumed)="record(tusUploadState, 'resumed')"
              (canceled)="record(tusUploadState, 'canceled')"
              (retried)="record(tusUploadState, 'retried')"
              (closed)="record(tusUploadState, 'closed')"
              (detailsOpened)="record(tusUploadState, 'detailsOpened')"
              (resumedWith)="record(tusUploadState, 'resumedWith')"
            />
          }
        </div>
        <p class="mat-body-small">Last output: {{ lastOutput() }}</p>
      </section>

      <section class="flex flex-col gap-4">
        <h1>Upload cards next to the importation card that replaces them</h1>
        <div class="flex flex-row flex-wrap gap-4 items-start">
          <app-tus-upload-card [tusUploadState]="tusUploadStates[1]" />
          <app-project-importation-card [workspaceId]="workspaceId" [projectImportation]="pending" />
          <app-project-importation-card [workspaceId]="workspaceId" [projectImportation]="ongoingWithProgress" />
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h1>Ongoing - indeterminate, then determinate progress</h1>
        <div class="flex flex-row flex-wrap gap-4 items-start">
          <app-project-importation-card [workspaceId]="workspaceId" [projectImportation]="pending" />
          <app-project-importation-card [workspaceId]="workspaceId" [projectImportation]="ongoing" />
          <app-project-importation-card [workspaceId]="workspaceId" [projectImportation]="ongoingWithProgress" />
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h1>Action needed - pending invites to review</h1>
        <div class="flex flex-row flex-wrap gap-4 items-start">
          <app-project-importation-card [workspaceId]="workspaceId" [projectImportation]="actionNeeded" />
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h1>Failure</h1>
        <div class="flex flex-row flex-wrap gap-4 items-start">
          <app-project-importation-card [workspaceId]="workspaceId" [projectImportation]="invalidFile" />
          <app-project-importation-card [workspaceId]="workspaceId" [projectImportation]="serverError" />
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h1>Project cards - same generic card, for comparison</h1>
        <div class="flex flex-row flex-wrap gap-4 items-start">
          <app-project-card
            [workspaceId]="workspaceId"
            [name]="project.name"
            [color]="project.color"
            [description]="project.description"
            landingPage="/projects/1"
          />
          <app-project-card
            [workspaceId]="workspaceId"
            name="Overflow"
            [color]="4"
            description="A much longer description that will absolutely overflow three lines and should be clipped by line-clamp at the end of the third visible line."
            landingPage="/projects/2"
          />
          <app-project-card [workspaceId]="workspaceId" name="No description" [color]="1" landingPage="/projects/3" />
          <app-project-card
            [workspaceId]="workspaceId"
            name="No link"
            [color]="3"
            description="This project cannot be opened."
          />
          <app-project-card
            [workspaceId]="workspaceId"
            name="Private Project"
            [color]="4"
            description="You don't have access to this project."
            [disabled]="true"
          />
          <app-project-card [workspaceId]="workspaceId" />
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h1>Action cards - project invitation, next to a project card</h1>
        <div class="flex flex-row flex-wrap gap-4 items-start">
          <app-action-card
            [name]="project.name"
            [color]="project.color"
            cancelLabel="component.invitation.deny"
            submitLabel="component.invitation.accept"
          />
          <app-action-card
            name="A very long project name that overflows"
            [color]="4"
            cancelLabel="component.invitation.deny"
            submitLabel="component.invitation.accept"
          />
          <app-project-card
            [workspaceId]="workspaceId"
            [name]="project.name"
            [color]="project.color"
            [description]="project.description"
            landingPage="/projects/1"
          />
        </div>
      </section>
    </div>
  `,
})
class StoryProjectImportationCardStorybookComponent {
  readonly workspaceId = "workspace-1";
  readonly project = project;
  readonly lastOutput = signal("none yet");

  record(tusUploadState: TusUploadState, output: string): void {
    this.lastOutput.set(`${output} on ${tusUploadState.fileName}`);
  }

  // `bytesSent` reads as a percentage: every story upload is 100 bytes long.
  readonly tusUploadStates: TusUploadState[] = [
    upload({ id: "u-uploading-start", fileName: "backup.json", status: "uploading", bytesSent: 0 }),
    upload({ id: "u-uploading", fileName: "backup.json", status: "uploading", bytesSent: 42 }),
    upload({
      id: "u-uploading-end",
      fileName: "a-very-long-file-name-that-overflows-the-card.json",
      status: "uploading",
      bytesSent: 99,
    }),
    upload({ id: "u-retrying", fileName: "backup.json", status: "retrying", bytesSent: 42 }),
    upload({ id: "u-paused", fileName: "backup.json", status: "paused", bytesSent: 42 }),
    upload({
      id: "u-paused-long-name",
      fileName: "project-test-3bda3039-62c0-4d89-a094-d0191c35b1bf.json",
      status: "paused",
      bytesSent: 42,
    }),
    upload({ id: "u-resuming", fileName: "backup.json", status: "resuming", bytesSent: 42 }),
    upload({ id: "u-canceling", fileName: "backup.json", status: "canceling", bytesSent: 42 }),
    upload({
      id: "u-interrupted",
      fileName: "backup.json",
      status: "interrupted",
      fileSize: 12 * MEGABYTE,
      bytesSent: 5 * MEGABYTE,
    }),
    upload({
      id: "u-interrupted-long-name",
      fileName: "project-test-3bda3039-62c0-4d89-a094-d0191c35b1bf.json",
      status: "interrupted",
      fileSize: 12 * MEGABYTE,
      bytesSent: 5 * MEGABYTE,
    }),
    upload({
      id: "u-failed-server",
      fileName: "backup.json",
      status: "failed",
      bytesSent: 42,
      errorKey: "project.new_project.upload.status.server_not_responding",
    }),
    upload({
      id: "u-failed-session",
      fileName: "backup.json",
      status: "failed",
      bytesSent: 42,
      errorKey: "project.new_project.upload.status.session_expired",
    }),
    upload({
      id: "u-rejected-forbidden",
      fileName: "backup.json",
      status: "rejected",
      bytesSent: 42,
      errorKey: "project.new_project.upload.status.forbidden",
    }),
    upload({
      id: "u-rejected-file-refused",
      fileName: "backup.json",
      status: "rejected",
      bytesSent: 100,
      errorKey: "project.new_project.upload.status.file_refused",
      errorMessage: "Suspicious file, try to shorten the file name",
    }),
  ];

  readonly pending: ProjectImportation = makeProjectImportation({
    id: "importation-pending",
    status: ImportationStatus.PENDING,
    sourceName: "importation-pending.json",
    project: null,
  });
  readonly ongoing: ProjectImportation = makeProjectImportation({
    id: "importation-ongoing",
    status: ImportationStatus.ONGOING,
    project,
  });
  readonly ongoingWithProgress: ProjectImportation = makeProjectImportation({
    id: "importation-ongoing-with-progress",
    status: ImportationStatus.ONGOING,
    extraData: { progressPercentage: 42 },
    project,
  });
  readonly actionNeeded: ProjectImportation = makeProjectImportation({
    id: "importation-action-needed",
    status: ImportationStatus.ACTION_NEEDED,
    pendingInvites: [
      { email: "gigi@example.com", roleId: "role-1" },
      { email: "ayla@example.com", roleId: "role-1" },
    ],
    project,
  });
  readonly invalidFile: ProjectImportation = makeProjectImportation({
    id: "importation-invalid-file",
    status: ImportationStatus.FAILURE,
    extraData: { errorCode: ImportationError.INVALID },
    sourceName: "importation-invalid-file.json",
    project: null,
  });
  readonly serverError: ProjectImportation = makeProjectImportation({
    id: "importation-server-error",
    status: ImportationStatus.FAILURE,
    extraData: { errorCode: ImportationError.SERVER_ERROR },
    project,
  });
}

type Story = StoryObj<StoryProjectImportationCardStorybookComponent>;

const meta: Meta<StoryProjectImportationCardStorybookComponent> = {
  component: StoryProjectImportationCardStorybookComponent,
  title: "Components/ProjectImportationCard",
  decorators: [
    withTransloco,
    moduleMetadata({}),
    applicationConfig({
      providers: [provideHttpClient(), provideRouter([{ path: "**", children: [] }]), provideTranslocoScope("project")],
    }),
  ],
};

export default meta;

export const Compositions: Story = {
  render: (args) => ({
    props: args,
    template: `<app-project-importation-card-storybook />`,
  }),
};
