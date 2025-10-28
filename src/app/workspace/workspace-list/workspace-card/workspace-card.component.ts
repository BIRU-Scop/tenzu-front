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

import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { TranslocoDirective } from "@jsverse/transloco";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { WorkspaceSummary } from "@tenzu/repository/workspace";
import { MatDivider } from "@angular/material/divider";

@Component({
  selector: "app-workspace-card",
  imports: [AvatarComponent, MatIcon, RouterLink, RouterLinkActive, MatButton, TranslocoDirective, MatDivider],
  template: `
    @let _workspace = workspace();
    <ng-container *transloco="let t">
      <div class="flex flex-row items-center gap-2 mb-2">
        <app-avatar [name]="_workspace.name" [color]="_workspace.color" />
        @if (_workspace.userIsMember) {
          <a class="mat-title-medium" [routerLink]="['workspace', _workspace.id]">{{ _workspace.name }} </a>
        } @else {
          {{ _workspace.name }}
        }
        @if (_workspace.userCanCreateProjects) {
          <a
            class="primary-button ml-auto"
            routerLink="/new-project"
            [queryParams]="{ workspaceId: _workspace.id }"
            routerLinkActive="active"
            ariaCurrentWhenActive="page"
            mat-stroked-button
          >
            <mat-icon>add</mat-icon>
            {{ t("commons.project") }}
          </a>
        } @else if (_workspace.userIsInvited) {
          <button
            class="secondary-button"
            mat-flat-button
            type="button"
            [attr.aria-label]="'component.invitation.accept'"
            (click)="submitted.emit()"
          >
            {{ t("component.invitation.accept") }}
          </button>
          <button
            class="error-button"
            mat-flat-button
            type="button"
            [attr.aria-label]="'component.invitation.deny'"
            (click)="canceled.emit()"
          >
            {{ t("component.invitation.deny") }}
          </button>
        }
      </div>
      <mat-divider />
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceCardComponent {
  workspace = input.required<WorkspaceSummary>();

  submitted = output<void>();
  canceled = output<void>();
}
