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
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { MatTabLink, MatTabNav, MatTabNavPanel } from "@angular/material/tabs";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
    selector: "app-settings",
    imports: [RouterOutlet, MatTabNavPanel, MatTabNav, MatTabLink, RouterLinkActive, RouterLink, TranslocoDirective],
    template: `<nav
      mat-tab-nav-bar
      mat-stretch-tabs="false"
      mat-align-tabs="center"
      [tabPanel]="tabPanel"
      *transloco="let t; prefix: 'settings'"
    >
      @for (link of links; track link) {
        <a
          mat-tab-link
          [active]="routerLinkActive.isActive"
          [routerLink]="link.href"
          routerLinkActive
          #routerLinkActive="routerLinkActive"
          [attr.data-testid]="link.name"
        >
          {{ t(link.name) }}
        </a>
      }
    </nav>
    <mat-tab-nav-panel #tabPanel class="grid grid-cols-1 place-items-center py-4"
      ><router-outlet
    /></mat-tab-nav-panel>`,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
  baseUrl = `/settings/`;
  links = [
    {
      name: "navigation.profile",
      href: `${this.baseUrl}/profile`,
    },
    {
      name: "navigation.security",
      href: `${this.baseUrl}/security`,
    },
    {
      name: "navigation.delete",
      href: `${this.baseUrl}/delete`,
    },
  ];
}
