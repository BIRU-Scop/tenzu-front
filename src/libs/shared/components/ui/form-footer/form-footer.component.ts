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

import { ChangeDetectionStrategy, Component, Directive, input } from "@angular/core";
import { BackDirective } from "@tenzu/directives/back/back.directive";
import { ButtonCancelComponent } from "@tenzu/shared/components/ui/button/button-cancel.component";

@Directive({
  selector: "app-form-footer-secondary-action, [appFormFooterSecondaryAction]",
})
export class FormFooterSecondaryActionDirective {}

@Component({
  selector: "app-form-footer",
  imports: [BackDirective, ButtonCancelComponent],
  template: `
    <div class="flex gap-4 justify-end">
      @if (secondaryAction()) {
        <ng-content select="app-form-footer-secondary-action, [appFormFooterSecondaryAction]">
          <app-button-cancel appBack />
        </ng-content>
      }
      <ng-content></ng-content>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFooterComponent {
  secondaryAction = input<boolean>(true);
}
