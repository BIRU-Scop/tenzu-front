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

import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatDivider } from "@angular/material/divider";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-pending-verification",
  imports: [FormsModule, MatButton, ReactiveFormsModule, TranslocoDirective, MatDivider, RouterLink],
  template: ` <ng-container *transloco="let t">
    <h1 class="mat-headline-medium">{{ t("auth.signup.verify.title") }}</h1>
    <p class="mat-body-medium">
      {{ t("auth.signup.verify.verification_link_sent") }}
      <strong data-testid="sentEmail-block">{{ email() }}</strong>
    </p>
    <p class="mat-body-medium">
      {{ t("auth.signup.verify.mail_not_received") }}
    </p>
    <button
      data-testid="resendMail-button"
      mat-stroked-button
      tabindex="1"
      (keydown.enter)="resendEmail.emit()"
      (click)="resendEmail.emit()"
      class="primary-button"
    >
      {{ t("auth.signup.verify.resend_button") }}
    </button>
    <mat-divider></mat-divider>
    <footer class="text-center">
      <p class="mat-body-medium">
        {{ t("auth.signup.footer.already_account") }}
        <a [routerLink]="['/login']">{{ t("auth.signup.footer.login") }}</a>
      </p>
    </footer>
  </ng-container>`,
  styles: `
    :host {
      @apply flex flex-col gap-4;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PendingVerificationComponent {
  email = input.required<string>();
  resendEmail = output();
}
