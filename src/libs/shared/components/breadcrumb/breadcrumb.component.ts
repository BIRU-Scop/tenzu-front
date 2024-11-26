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
import { RouterLink } from "@angular/router";
import { UpperCasePipe } from "@angular/common";
import { BreadcrumbStore } from "@tenzu/data/breadcrumb";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
    selector: "app-breadcrumb",
    imports: [RouterLink, UpperCasePipe, TranslocoDirective],
    template: ` <div *transloco="let t" class="mat-label-medium text-neutral-40 flex flex-wrap gap-1">
    @for (breadCrumb of breadcrumbStore.breadCrumbConfig(); track breadCrumb.label; let last = $last) {
      @if (!last) {
        <a [routerLink]="breadCrumb.link">
          @if (breadCrumb.doTranslation) {
            {{ t(breadCrumb.label) | uppercase }}
          } @else {
            {{ breadCrumb.label | uppercase }}
          }
        </a>
        /
      } @else {
        @if (breadCrumb.doTranslation) {
          {{ t(breadCrumb.label) | uppercase }}
        } @else {
          {{ breadCrumb.label | uppercase }}
        }
      }
    }
  </div>`,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbComponent {
  breadcrumbStore = inject(BreadcrumbStore);
}
