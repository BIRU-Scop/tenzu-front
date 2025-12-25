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

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { ReactiveFormsModule } from "@angular/forms";
import { TranslocoDirective } from "@jsverse/transloco";
import { Field, FieldTree } from "@angular/forms/signals";
import { MatInput } from "@angular/material/input";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatLabel, ReactiveFormsModule, TranslocoDirective, MatFormField, MatError, MatLabel, Field, MatInput],
  providers: [],
  selector: "app-email-field",
  host: {
    class: "flex",
  },
  styles: ``,
  template: `
    @let _field = field();
    <mat-form-field *transloco="let t" subscriptSizing="fixed" class="flex grow">
      <mat-label>
        {{ t("component.email.label") }}
      </mat-label>
      <input matInput [field]="_field" autocomplete="email" />
      @if (_field().touched() && _field().invalid()) {
        <mat-error>
          @for (error of _field().errors(); track error.kind) {
            {{ t(error.message || "") }}
          }
        </mat-error>
      }
    </mat-form-field>
  `,
})
export class EmailFieldComponent {
  field = input.required<FieldTree<string, string>>();
}
