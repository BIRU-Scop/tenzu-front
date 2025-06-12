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

import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { TranslocoDirective } from "@jsverse/transloco";
import { UserDeleteInfo } from "@tenzu/repository/user";
import { MatIcon } from "@angular/material/icon";
import { MatExpansionModule } from "@angular/material/expansion";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { RouterLink } from "@angular/router";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";

export type ConfirmDialogData = UserDeleteInfo;

@Component({
  selector: "app-confirm-dialog",
  imports: [
    TranslocoDirective,
    MatDialogModule,
    MatButton,
    MatIcon,
    MatExpansionModule,
    AvatarComponent,
    RouterLink,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
  ],
  template: `
    <ng-container *transloco="let t; prefix: 'settings.delete'">
      <h2 id="aria-label" mat-dialog-title>{{ t("confirm_dialog.title") }}</h2>
      <mat-dialog-content class="space-y-4">
        @if (data.onlyOwnerCollectiveWorkspaces.length) {
          <mat-expansion-panel [expanded]="true">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon class="text-on-error mr-3">warning</mat-icon>
                <p class="text-on-error">{{ t("confirm_dialog.only_owner_workspaces") }}</p>
              </mat-panel-title>
            </mat-expansion-panel-header>
            <div class="flex flex-col gap-y-4">
              <p class="text-sm text-on-error-container">{{ t("confirm_dialog.info_owner_workspaces") }}</p>
              @for (workspace of data.onlyOwnerCollectiveWorkspaces; track workspace.id) {
                <div class="flex flex-row gap-x-4 items-center">
                  <app-avatar [name]="workspace.name" [color]="workspace.color" />
                  <a class="grow" target="_blank" [routerLink]="['workspace', workspace.id, 'members']">
                    {{ workspace.name }}
                  </a>
                </div>
              }
            </div>
          </mat-expansion-panel>
        }
        @if (data.onlyOwnerCollectiveProjects.length) {
          <mat-expansion-panel [expanded]="true">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon class="text-on-error mr-3">warning</mat-icon>
                <p class="text-on-error">{{ t("confirm_dialog.only_owner_projects") }}</p>
              </mat-panel-title>
            </mat-expansion-panel-header>
            <div class="flex flex-col gap-y-4">
              <p class="text-sm text-on-error-container">{{ t("confirm_dialog.info_owner_projects") }}</p>
              @for (project of data.onlyOwnerCollectiveProjects; track project.id) {
                <div class="flex flex-row gap-x-4 items-center">
                  <app-avatar [name]="project.name" [color]="project.color" />
                  <a
                    target="_blank"
                    [routerLink]="['workspace', project.workspaceId, 'project', project.id, 'members']"
                  >
                    {{ project.name }}
                  </a>
                </div>
              }
            </div>
          </mat-expansion-panel>
        }
        @if (data.onlyMemberWorkspaces.length) {
          <mat-expansion-panel [expanded]="false">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon class="text-on-warning-container mr-3">warning</mat-icon>
                {{ t("confirm_dialog.only_member_workspace") }}
              </mat-panel-title>
            </mat-expansion-panel-header>
            <div class="flex flex-col gap-y-4 ">
              <p class="text-sm">{{ t("confirm_dialog.info_delete_workspace") }}</p>
              @for (workspace of data.onlyMemberWorkspaces; track workspace.id) {
                <div class="flex flex-row gap-x-4 items-center">
                  <app-avatar [name]="workspace.name" [color]="workspace.color" />
                  <a class="grow" target="_blank" [routerLink]="['workspace', workspace.id, 'members']">
                    {{ workspace.name }}
                  </a>
                  <button mat-flat-button class="primary-button" [matMenuTriggerFor]="menu" *transloco="let c">
                    {{ workspace.projects.length }} {{ c("commons.projects") }}
                  </button>

                  <mat-menu #menu="matMenu">
                    @for (project of workspace.projects; track project.id) {
                      <a
                        target="_blank"
                        [routerLink]="['workspace', workspace.id, 'project', project.id, 'members']"
                        mat-menu-item
                      >
                        {{ project.name }}
                      </a>
                    }
                  </mat-menu>
                </div>
              }
            </div>
          </mat-expansion-panel>
        }
        @if (data.onlyMemberProjects.length) {
          <mat-expansion-panel [expanded]="false">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon class="text-on-warning-container mr-3">warning</mat-icon>
                {{ t("confirm_dialog.only_member_project") }}
              </mat-panel-title>
            </mat-expansion-panel-header>
            <div class="flex flex-col gap-y-4">
              <p class="text-sm">{{ t("confirm_dialog.info_delete_project") }}</p>
              @for (project of data.onlyMemberProjects; track project.id) {
                <div class="flex flex-row gap-x-4 items-center">
                  <app-avatar [name]="project.name" [color]="project.color" />
                  <a
                    target="_blank"
                    [routerLink]="['workspace', project.workspaceId, 'project', project.id, 'members']"
                  >
                    {{ project.name }}
                  </a>
                </div>
              }
            </div>
          </mat-expansion-panel>
        }
      </mat-dialog-content>
      <mat-dialog-actions>
        <button
          mat-flat-button
          class="error-button"
          [mat-dialog-close]="true"
          [disabled]="data.onlyOwnerCollectiveWorkspaces.length !== 0 || data.onlyOwnerCollectiveProjects.length !== 0"
        >
          {{ t("delete_account") }}
        </button>
        <button mat-button [mat-dialog-close]="false">
          {{ t("keep_my_account") }}
        </button>
      </mat-dialog-actions>
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteAccountDialogComponent {
  data: ConfirmDialogData = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
