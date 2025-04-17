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

import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from "@angular/material/dialog";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: "app-workspace-placeholder-dialog",
  imports: [MatDialogContent, MatDialogActions, MatDialogTitle, MatDialogClose, MatButton, TranslocoDirective],
  template: `
    <ng-container *transloco="let t; prefix: 'workspace'">
      <h2 id="aria-label" mat-dialog-title>{{ t("placeholder.placeholder_title") }}</h2>
      <mat-dialog-content
        ><p>{{ t("placeholder.placeholder_text") }}</p>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-flat-button class="primary-button" [mat-dialog-close]="true">
          {{ t("create.create_workspace") }}
        </button>
        <button
          *transloco="let t; prefix: 'commons'"
          mat-dialog-close
          mat-stroked-button
          class="primary-button whitespace-nowrap shrink-0"
        >
          {{ t("cancel") }}
        </button>
      </mat-dialog-actions>
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspacePlaceholderDialogComponent {}
