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

import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { NotificationService } from "@tenzu/utils/services/notification";
import { AuthConfigStore } from "@tenzu/repository/auth/auth-config.store";
import { EnvBannerComponent } from "@tenzu/shared/components/env-banner/env-banner.component";

@Component({
  selector: "app-auth-layout",
  imports: [RouterOutlet, MatIcon, EnvBannerComponent],
  template: `
    <app-env-banner></app-env-banner>
    <main class="h-[100vh] flex flex-col items-center justify-center gap-4">
      <div class="h-[200px]">
        <mat-icon
          class="icon-full"
          [class.error]="authConfigStore.formHasError()"
          svgIcon="logo-full-animated"
          aria-hidden="true"
        ></mat-icon>
      </div>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: `
    :host ::ng-deep .error .logo-eye {
      color: var(--mat-sys-on-error);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AuthComponent {
  notificationService = inject(NotificationService);
  iconRegistry = inject(MatIconRegistry);
  sanitizer = inject(DomSanitizer);
  readonly authConfigStore = inject(AuthConfigStore);

  constructor() {
    this.iconRegistry.addSvgIcon(
      "logo-full-animated",
      this.sanitizer.bypassSecurityTrustResourceUrl("logo-full-tenzu-animated.svg"),
    );
  }
}
