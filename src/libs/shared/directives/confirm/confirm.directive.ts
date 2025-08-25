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

import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  HostListener,
  inject,
  input,
  InputSignal,
  output,
} from "@angular/core";
import { MatButton } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from "@angular/material/dialog";
import { NgComponentOutlet } from "@angular/common";
import { TranslocoDirective } from "@jsverse/transloco";

export type ConfirmPopupData = {
  title?: string;
  message?: string;
  actionButtonContent?: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component?: any;
  deleteAction: boolean;
};

@Component({
  selector: "app-confirm-popup-component",
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [``],
  template: `
    <ng-container *transloco="let t; prefix: 'directives.confirm_popup_component'">
      @let _data = data();
      @if (_data.title) {
        <h2 id="aria-label" mat-dialog-title>{{ _data.title }}</h2>
      }

      <mat-dialog-content class=".mat-body-medium">
        @if (_data.component) {
          <ng-container *ngComponentOutlet="_data.component"></ng-container>
        } @else {
          @if (_data.message) {
            <p>{{ _data.message }}</p>
          } @else if (_data.deleteAction) {
            <p>{{ t("textDelete") }}</p>
          } @else {
            <p>{{ t("textConfirm") }}</p>
          }
        }
      </mat-dialog-content>
      <mat-dialog-actions [align]="'end'">
        <button mat-flat-button class="secondary-button" [mat-dialog-close]="false">{{ t("cancelAction") }}</button>
        @if (_data.deleteAction) {
          <button mat-flat-button class="error-button" [mat-dialog-close]="true">
            {{ _data.actionButtonContent || t("deleteAction") }}
          </button>
        } @else {
          <button mat-flat-button class="tertiary-button" [mat-dialog-close]="true">
            {{ _data.actionButtonContent || t("confirmAction") }}
          </button>
        }
      </mat-dialog-actions>
    </ng-container>
  `,
  imports: [
    MatDialogActions,
    MatButton,
    MatDialogClose,
    MatDialogContent,
    NgComponentOutlet,
    TranslocoDirective,
    MatDialogTitle,
  ],
})
export class ConfirmPopupComponent {
  data: InputSignal<ConfirmPopupData> = inject(MAT_DIALOG_DATA);
  open = true;
  toggle() {
    this.open = !this.open;
  }
}

@Directive({
  selector: "[appConfirm]",
  standalone: true,
})
export class ConfirmDirective {
  dialog = inject(MatDialog);
  data = input<ConfirmPopupData>({
    deleteAction: false,
  });
  popupConfirm = output<void>();

  @HostListener("click")
  onClick() {
    const ref = this.dialog.open<ConfirmPopupComponent, InputSignal<ConfirmPopupData>>(ConfirmPopupComponent, {
      data: this.data,
    });
    ref.afterClosed().subscribe((confirm) => {
      if (confirm) {
        this.popupConfirm.emit();
      }
    });
  }
}
