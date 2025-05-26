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

import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { MatCard, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { TranslocoDirective } from "@jsverse/transloco";
import { AvatarComponent } from "@tenzu/shared/components/avatar";

@Component({
  selector: "app-workspace-card",
  imports: [
    AvatarComponent,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatIcon,
    RouterLink,
    RouterLinkActive,
    MatButton,
    TranslocoDirective,
  ],
  template: `
    <mat-card appearance="outlined" class="heading-card" *transloco="let t">
      <mat-card-header>
        <app-avatar mat-card-avatar [name]="name()" [color]="color()" />
        <mat-card-title>
          <a [routerLink]="['workspace', id()]">{{ name() }} </a></mat-card-title
        >
        @if (!userIsInvited()) {
          <button
            class="primary-button"
            routerLink="new-project"
            [queryParams]="{ workspaceId: id() }"
            routerLinkActive="active"
            ariaCurrentWhenActive="page"
            mat-stroked-button
          >
            <mat-icon>add</mat-icon>
            {{ t("commons.project") }}
          </button>
        } @else {
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
      </mat-card-header>
    </mat-card>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceCardComponent {
  name = input("");
  color = input(1);
  id = input("");
  userIsInvited = input(false);
  submitted = output<void>();
  canceled = output<void>();
}
