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

import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { animate, query, stagger, style, transition, trigger } from "@angular/animations";

import { WorkspacePlaceholderDialogComponent } from "./workspace-placeholder-dialog/workspace-placeholder-dialog.component";
import { RelativeDialogService } from "@tenzu/utils/services/relative-dialog/relative-dialog.service";
import {
  EnterNameDialogComponent,
  NameDialogData,
} from "@tenzu/shared/components/enter-name-dialog/enter-name-dialog.component";
import { Validators } from "@angular/forms";
import { ProjectService } from "@tenzu/data/project";
import { WorkspaceService } from "@tenzu/data/workspace/workspace.service";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { WorkspaceCardComponent } from "./workspace-card/workspace-card.component";
import { MatIcon } from "@angular/material/icon";
import { MatButton } from "@angular/material/button";
import { TranslocoDirective } from "@jsverse/transloco";
import { ProjectCardComponent } from "@tenzu/shared/components/project-card";
import { WorkspaceSkeletonComponent } from "./workspace-skeleton/workspace-skeleton.component";
import { CardSkeletonComponent } from "@tenzu/shared/components/skeletons/card-skeleton";
import { getProjectLandingPageUrl } from "@tenzu/utils/functions/urls";

@Component({
  selector: "app-workspace-list",
  imports: [
    WorkspaceCardComponent,
    MatIcon,
    MatButton,
    TranslocoDirective,
    ProjectCardComponent,
    WorkspaceSkeletonComponent,
    CardSkeletonComponent,
  ],
  template: `
    <div *transloco="let t; prefix: 'commons'" class="p-4 max-w-7xl mx-auto">
      <div class="flex flex-row">
        <h1 class="mat-headline-medium grow">{{ t("projects") }}</h1>
        <button
          (click)="openCreateDialog($event)"
          data-testid="create-workspace-open"
          class="tertiary-button"
          mat-stroked-button
        >
          <mat-icon>add</mat-icon>
          {{ t("workspace") }}
        </button>
      </div>
      @let workpaces = workspaceService.entities();
      @if (workpaces.length > 0) {
        <ul [@newItemsFlyIn]="workpaces.length" class="flex flex-col gap-8">
          @for (workspace of workpaces; track workspace.id) {
            <li>
              <app-workspace-card
                [name]="workspace.name"
                [color]="workspace.color"
                [id]="workspace.id"
              ></app-workspace-card>
              <ul class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-4">
                @for (project of workspace.latestProjects; track project.id) {
                  <li>
                    <app-project-card
                      [workspaceId]="workspace.id"
                      [name]="project.name"
                      [color]="project.color"
                      [description]="project.description ? project.description : null"
                      [landingPage]="getProjectLandingPageUrl(project)"
                    ></app-project-card>
                  </li>
                }
                @if (!workspace.latestProjects || workspace.latestProjects.length === 0) {
                  <li>
                    <app-project-card [workspaceId]="workspace.id"></app-project-card>
                  </li>
                }
              </ul>
            </li>
          }
        </ul>
      } @else {
        <ul class="flex flex-col gap-8">
          <li>
            <app-workspace-skeleton></app-workspace-skeleton>
            <ul class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-4">
              @for (skeleton of skeletons; track $index) {
                <li>
                  <app-card-skeleton></app-card-skeleton>
                </li>
              }
            </ul>
          </li>
        </ul>
      }
    </div>
  `,
  animations: [
    trigger("newItemsFlyIn", [
      transition(":enter, * => 0, * => -1", []),
      transition(":increment", [
        query(
          ":enter",
          [
            style({ opacity: 0, height: 0 }),
            stagger(50, [animate("200ms ease-out", style({ opacity: 1, height: "*" }))]),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceListComponent implements AfterViewInit, OnDestroy {
  readonly workspaceService = inject(WorkspaceService);
  readonly projectService = inject(ProjectService);
  readonly relativeDialog = inject(RelativeDialogService);
  readonly dialog = inject(MatDialog);
  readonly skeletons = Array(6);

  private init = async () => {
    this.workspaceService.list().then((workspaces) => {
      if (workspaces.length === 0) {
        this.openPlaceholderDialog();
      }
    });
  };

  ngOnDestroy(): void {
    this.workspaceService.resetEntities();
  }

  private openPlaceholderDialog = (event?: MouseEvent) => {
    const dialogRef = this.dialog.open(WorkspacePlaceholderDialogComponent, { ...matDialogConfig, disableClose: true });
    dialogRef.afterClosed().subscribe(() => {
      this.openCreateDialog(event);
    });
  };

  ngAfterViewInit(): void {
    this.init().then();
  }

  public openCreateDialog(event?: MouseEvent): void {
    const data: NameDialogData = {
      label: "workspace.create.workspace_name",
      action: "workspace.create.create_workspace",
      placeholder: "workspace.create.name_placeholder",
      validators: [
        {
          type: "required",
          message: "workspace.create.name_required",
          validatorFn: Validators.required,
        },
        {
          type: "maxLength",
          message: "form_errors.max_length",
          translocoParams: { length: 40 },
          validatorFn: Validators.maxLength(40),
        },
      ],
    };
    const dialogRef = this.relativeDialog.open(EnterNameDialogComponent, event?.target, {
      ...matDialogConfig,
      disableClose: this.workspaceService.entities().length === 0,
      relativeXPosition: "left",
      id: "create-workspace",
      data: data,
    });

    dialogRef.afterClosed().subscribe(async (name?: string) => {
      if (name) {
        const color = Math.floor(Math.random() * (8 - 1) + 1);
        await this.workspaceService.create({
          name,
          color,
        });
      } else if (this.workspaceService.entities().length === 0) {
        this.openPlaceholderDialog(event);
      }
    });
  }

  protected readonly getProjectLandingPageUrl = getProjectLandingPageUrl;
}
