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
import { RouterOutlet } from "@angular/router";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-auth-layout",
  standalone: true,
  imports: [RouterOutlet, MatIcon],
  template: `
    <main class="h-dvh flex flex-col items-center">
      <div class="w-[200px] mt-8"><mat-icon class="icon-full" svgIcon="logo-full-animated"></mat-icon></div>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent {
  iconRegistry = inject(MatIconRegistry);
  sanitizer = inject(DomSanitizer);
  constructor() {
    this.iconRegistry.addSvgIcon(
      "logo-full-animated",
      this.sanitizer.bypassSecurityTrustResourceUrl("logo-full-tenzu-animated.svg"),
    );
  }
}
