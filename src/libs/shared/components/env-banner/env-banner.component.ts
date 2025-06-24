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

import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import { ConfigAppService } from "../../../../app/config-app/config-app.service";

@Component({
  selector: "app-env-banner",
  imports: [TranslocoDirective],
  template: `
    @let env = configAppService.config().env;
    @if (env !== "production") {
      <div class="flex items-center" [class]="env" *transloco="let t">
        <p class="w-full text-sm text-wrap text-center p-3">
          {{ t("environment." + env) }}
        </p>
      </div>
    }
  `,
  styles: `
    .demo {
      background-color: var(--mat-sys-warning-container);
      color: var(--mat-sys-on-warning-container);
    }

    .dev {
      color: var(--mat-sys-on-error-container);
      background-color: var(--mat-sys-error-container);
    }

    .staging {
      color: var(--mat-sys-on-tertiary-container);
      background-color: var(--mat-sys-tertiary-container);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnvBannerComponent {
  configAppService = inject(ConfigAppService);
}
