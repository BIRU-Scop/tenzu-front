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

import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBar,
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarLabel,
} from "@angular/material/snack-bar";
import { NotificationMessage } from "./notification-message.model";
import { MatIcon } from "@angular/material/icon";
import { MatIconButton } from "@angular/material/button";
import { TranslocoDirective } from "@jsverse/transloco";
import { NgTemplateOutlet } from "@angular/common";
import { SafeHtmlPipe } from "../../../shared/pipes";

@Component({
  selector: "app-notification",
  imports: [
    MatSnackBarLabel,
    MatSnackBarActions,
    MatIcon,
    MatIconButton,
    MatSnackBarAction,
    TranslocoDirective,
    NgTemplateOutlet,
    SafeHtmlPipe,
  ],
  template: ` <div class="flex flex-row-reverse items-center" *transloco="let t">
    <ng-template #content let-data="data">
      <div matSnackBarLabel>
        @if (data.translocoTitle) {
          <p class="mat-title-small" [innerHTML]="t(data.title, data.translocoTitleParams) | safeHtml"></p>
        } @else {
          <p class="mat-title-small" [innerHTML]="data.title | safeHtml"></p>
        }
        @if (data.translocoDetail && data.detail) {
          <p class="mat-body-medium" [innerHTML]="t(data.detail, data.translocoDetailParams) | safeHtml"></p>
        } @else if (data.detail) {
          <p class="mat-body-medium" [innerHTML]="data.detail | safeHtml"></p>
        }
      </div>
    </ng-template>
    <div class="flex" matSnackBarActions>
      <button mat-icon-button matSnackBarAction [attr.aria-label]="t('commons.close')" (click)="close()">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    @switch (data.type) {
      @case ("error") {
        <ng-container [ngTemplateOutlet]="content" [ngTemplateOutletContext]="{ data: data }"></ng-container>
      }
      @case ("success") {
        <ng-container [ngTemplateOutlet]="content" [ngTemplateOutletContext]="{ data: data }"></ng-container>
      }
      @case ("warning") {
        <ng-container [ngTemplateOutlet]="content" [ngTemplateOutletContext]="{ data: data }"></ng-container>
      }
      @case ("info") {
        <ng-container [ngTemplateOutlet]="content" [ngTemplateOutletContext]="{ data: data }"></ng-container>
      }
    }
  </div>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent {
  data: NotificationMessage = inject(MAT_SNACK_BAR_DATA);
  matSnackBar = inject(MatSnackBar);

  close() {
    this.matSnackBar.dismiss();
  }
}
