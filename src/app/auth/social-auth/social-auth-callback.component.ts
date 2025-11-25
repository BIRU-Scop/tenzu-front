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
import { ActivatedRoute, Router } from "@angular/router";
import { debug } from "@tenzu/utils/functions/logging";
import { AuthService, ProviderCallback, Tokens } from "@tenzu/repository/auth";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: "app-social-auth-callback",
  standalone: true,
  imports: [],
  template: `
    <!--    
        TODO put somme message to explain social auth failure, a button to go elsewhere
        and maybe a resend verification email button for user awaiting validation
        (this might means resubmitting the social signup)
        Also handle user cancellation
     -->
    <!--    if error is "denied", that means the user still needs to be validated before they can login -->
    @if (callback.error) {
      {{ callback.error }}: {{ callback.error_process }}
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SocialAuthCallbackComponent {
  callback: ProviderCallback = {};
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly authService = inject(AuthService);

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((value) => {
      debug("social auth callback", "query params", value);
      this.callback = value as ProviderCallback;
      if (!this.callback.error) {
        this.authService.refresh(this.callback as Tokens).subscribe(() => this.router.navigateByUrl("/"));
      }
    });
  }
}
