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

import { Component, input, output } from "@angular/core";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { CardComponent, CardHeaderActionDirective } from "@tenzu/shared/components/ui/card/card.component";

@Component({
  selector: "app-action-card",
  imports: [CardComponent, CardHeaderActionDirective, ButtonComponent],
  template: `
    <app-card [name]="name()" [color]="color()">
      <app-button
        appCardHeaderAction
        class="ml-auto"
        [translocoKey]="cancelLabel()"
        [iconOnly]="true"
        level="error"
        (click)="canceled.emit()"
        iconName="block"
      />
      <app-button
        class="mt-auto self-center whitespace-nowrap"
        [translocoKey]="submitLabel()"
        level="primary"
        (click)="submitted.emit()"
        iconName="check"
      />
    </app-card>
  `,
  styles: ``,
})
export class ActionCardComponent {
  name = input("");
  color = input(0);
  cancelLabel = input("");
  submitLabel = input("");
  canceled = output<void>();
  submitted = output<void>();
}
