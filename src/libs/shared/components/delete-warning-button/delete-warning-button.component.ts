/*
 * Copyright (C) 2025 BIRU
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
import { ConfirmDirective } from "@tenzu/directives/confirm";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: "app-delete-warning-button",
  imports: [ConfirmDirective, MatButton, MatIcon, TranslocoDirective],
  template: `
    <div class="flex flex-col gap-y-2" *transloco="let t">
      <h2 class="mat-headline-small">{{ t(translocoKeyTitle()) }}</h2>
      <div class="flex flex-row">
        <mat-icon class="text-on-error-container pr-3 self-center">warning</mat-icon>
        <p class="mat-body-medium text-on-error-container align-middle">
          {{ t(translocoKeyWarningMessage()) }}
        </p>
      </div>
      <button
        mat-flat-button
        class="error-button w-fit"
        appConfirm
        [data]="{ deleteAction: true }"
        (popupConfirm)="popupConfirm.emit()"
      >
        {{ t("project.buttons.delete") }}
      </button>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteWarningButtonComponent {
  translocoKeyTitle = input.required<string>();
  translocoKeyWarningMessage = input.required<string>();
  popupConfirm = output<void>();
}
