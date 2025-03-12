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
import { AvatarComponent } from "../avatar/avatar.component";
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "app-project-special-card",
  imports: [
    AvatarComponent,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    TranslocoDirective,
    MatButton,
    MatIconButton,
    MatTooltip,
    MatIcon,
  ],
  template: `
    <mat-card appearance="outlined" class="min-h-[90px]" *transloco="let t; prefix: 'component.project_special_card'">
      <mat-card-header>
        <app-avatar mat-card-avatar [name]="name()" [color]="color()" />
        <mat-card-title>
          {{ name() }}
        </mat-card-title>
        <button
          mat-icon-button
          class="error-button"
          [attr.aria-label]="t('cancel')"
          [matTooltip]="t('cancel')"
          (click)="canceled.emit()"
        >
          <mat-icon>close</mat-icon>
        </button>
      </mat-card-header>
      <mat-card-content>
        <button
          class="secondary-button"
          mat-flat-button
          type="button"
          [attr.aria-label]="t('submit')"
          (click)="submitted.emit()"
        >
          {{ t("submit") }}
        </button>
      </mat-card-content>
    </mat-card>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectSpecialCardComponent {
  name = input("");
  color = input(0);
  workspaceId = input<string | null>("");
  canceled = output<void>();
  submitted = output<void>();
}
