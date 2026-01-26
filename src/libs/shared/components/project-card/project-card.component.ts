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

import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core";
import { AvatarComponent } from "../avatar/avatar.component";
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { TranslocoDirective } from "@jsverse/transloco";
import { RouterLink } from "@angular/router";
import { MatIcon } from "@angular/material/icon";
import { NgStyle } from "@angular/common";
import { ButtonAddComponent } from "@tenzu/shared/components/ui/button/button-add.component";
import {
  ProjectCreateDialog,
  ProjectCreateDialogData,
} from "@tenzu/shared/components/project-create-dialog/project-create-dialog";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { MatDialog } from "@angular/material/dialog";
import { WorkspaceSummary } from "@tenzu/repository/workspace";
import { ProjectSummary } from "@tenzu/repository/project";

@Component({
  selector: "app-project-card",
  imports: [
    AvatarComponent,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    TranslocoDirective,
    RouterLink,
    MatIcon,
    NgStyle,
    ButtonAddComponent,
  ],
  template: `
    @let _landingPage = landingPage();
    @let _name = name();
    @let _color = color();
    @let _description = description();
    @let _workspaceId = workspaceId();
    <mat-card
      appearance="outlined"
      class="min-h-[100px] w-[200px]"
      [ngStyle]="disabled() ? { position: 'absolute', filter: 'blur(3px)' } : {}"
      *transloco="let t; prefix: 'component.project_card'"
    >
      <mat-card-header>
        <app-avatar mat-card-avatar [name]="_name" [color]="_color" />
        <mat-card-title class="!contents min-h-[40px]">
          @if (_landingPage) {
            <a [routerLink]="_landingPage">{{ _name }}</a>
          } @else {
            {{ _name }}
          }
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="pt-2 pl-2 flex flex-col gap-1">
          @if (!_name && !_description && !_color) {
            <span class="pb-2">{{ t("create_first_project") }}</span>
            @if (_workspaceId) {
              <app-button-add
                class="ml-auto"
                [level]="'primary'"
                [translocoKey]="'commons.project'"
                (click)="openCreateProject(_workspaceId)"
              ></app-button-add>
            }
          } @else {
            <p>
              {{ _description }}
            </p>
          }
        </div>
      </mat-card-content>
    </mat-card>
    @if (disabled()) {
      <div class="min-h-[100px] w-[200px] flex items-center justify-center relative">
        <mat-icon class="text-on-primary-container">lock</mat-icon>
      </div>
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCardComponent {
  readonly dialog = inject(MatDialog);

  workspaceId = input.required<WorkspaceSummary["id"]>();
  name = input<ProjectSummary["name"]>("");
  color = input<ProjectSummary["color"]>(0);
  description = input<ProjectSummary["description"] | null>("");
  landingPage = input<ProjectSummary["landingPage"] | null>("");
  disabled = input<boolean>(false);

  openCreateProject(workspaceId: WorkspaceSummary["id"]): void {
    const data: ProjectCreateDialogData = {
      workspaceId,
    };
    this.dialog.open(ProjectCreateDialog, {
      ...matDialogConfig,
      minWidth: 850,
      data: data,
    });
  }
}
