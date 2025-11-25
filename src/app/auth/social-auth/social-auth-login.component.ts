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

import { ChangeDetectionStrategy, Component, inject, input, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "@tenzu/repository/auth";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";
import { KeyValuePipe } from "@angular/common";
import { MatCheckbox } from "@angular/material/checkbox";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ConfigAppService } from "../../config-app/config-app.service";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatDivider } from "@angular/material/divider";

@Component({
  selector: "app-social-auth-login",
  standalone: true,
  imports: [
    ButtonComponent,
    KeyValuePipe,
    MatCheckbox,
    ReactiveFormsModule,
    TranslocoDirective,
    FormsModule,
    MatDivider,
  ],
  template: `
    <div *transloco="let t" class="flex flex-col gap-4">
      <mat-divider></mat-divider>
      @let configLegal = configAppService.configLegal();
      @let _acceptTerms = acceptTerms();
      @let _signup = signup();
      @for (provider of authService.providers(); track provider.id; let isFirst = $first, isLast = $last) {
        @if (isFirst) {
          <p class="mat-body-medium text-center">{{ t("signup.alternatives") }}</p>
        }
        @let providerRedirect = authService.redirectToProviderBaseParams(provider.id);
        <!-- ngNoForm is an undocumented property to force classic form behaviour instead of Angular's-->
        <form ngNoForm class="flex flex-col" [action]="providerRedirect.url" method="post">
          @for (fieldData of providerRedirect.body | keyvalue; track fieldData.key) {
            <input type="hidden" [name]="fieldData.key" [value]="fieldData.value" />
          }
          @for (fieldData of this.route.snapshot.queryParams | keyvalue; track fieldData.key) {
            <input type="hidden" [name]="fieldData.key" [value]="fieldData.value" />
          }
          @if (configLegal) {
            <input type="hidden" name="acceptTermsOfService" [value]="_acceptTerms" />
            <input type="hidden" name="acceptPrivacyPolicy" [value]="_acceptTerms" />
          }
          <app-button
            level="primary"
            [disabled]="(configLegal || false) && _signup && !_acceptTerms"
            type="submit"
            translocoKey="signup.continue_with"
            [translocoValue]="{ provider: provider.name }"
          />
        </form>

        @if (isLast && configLegal && signup()) {
          <div class="min-w-full w-min">
            <mat-checkbox [(ngModel)]="acceptTerms" required>
              <div class="flex flex-col">
                <small
                  class="mat-body-small"
                  [innerHTML]="
                    t('signup.terms_and_privacy', {
                      termsOfService: configLegal.tos,
                      privacyPolicy: configLegal.privacy,
                    })
                  "
                ></small>
              </div>
            </mat-checkbox>
          </div>
        }
      } @empty {
        <app-button level="primary" [disabled]="true" translocoKey="signup.no_social_connect" />
      }
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SocialAuthLoginComponent {
  readonly route = inject(ActivatedRoute);
  readonly authService = inject(AuthService);
  readonly configAppService = inject(ConfigAppService);

  acceptTerms = signal(false);
  signup = input.required<boolean>();
}
