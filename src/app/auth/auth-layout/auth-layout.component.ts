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
import { NotificationService } from "@tenzu/utils/services/notification";
import { AuthFormStateStore } from "../auth-form-state.store";

@Component({
  selector: "app-auth-layout",
  imports: [RouterOutlet, MatIcon],
  template: `
    <main class="h-[100vh] flex flex-col items-center justify-center gap-4">
      <div class="h-[200px]">
        <mat-icon
          class="icon-full"
          [class.error]="authFormStateStore.hasError()"
          svgIcon="logo-full-animated"
          aria-hidden="true"
        ></mat-icon>
      </div>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: ``,
  styleUrl: `auth-layout.component.scss`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AuthLayoutComponent {
  notificationService = inject(NotificationService);
  iconRegistry = inject(MatIconRegistry);
  sanitizer = inject(DomSanitizer);
  readonly authFormStateStore = inject(AuthFormStateStore);

  constructor() {
    this.iconRegistry.addSvgIcon(
      "logo-full-animated",
      this.sanitizer.bypassSecurityTrustResourceUrl("logo-full-tenzu-animated.svg"),
    );
  }
}
