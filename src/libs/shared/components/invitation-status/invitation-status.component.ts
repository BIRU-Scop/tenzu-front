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

import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { InvitationBase, InvitationStatus } from "@tenzu/repository/membership";
import { ChipComponent } from "@tenzu/shared/components/chip/chip.component";
import { TranslocoDirective } from "@jsverse/transloco";
import { TranslocoDatePipe } from "@jsverse/transloco-locale";

@Component({
  selector: "app-invitation-status",
  imports: [ChipComponent, TranslocoDirective, TranslocoDatePipe],
  template: `
    <div class="flex flex-row gap-2 items-center" *transloco="let t">
      <app-chip [label]="t(translatedStatusKey())" [color]="statusColor()"></app-chip>
      @if (invitation().status === InvitationStatus.PENDING) {
        <p class="mat-label-large text-on-surface-variant">
          {{
            t("component.invitation.last_sent", {
              var: lastSentAt() | translocoDate: { dateStyle: "short", timeStyle: "short" },
            })
          }}
        </p>
      }
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitationStatusComponent {
  InvitationStatus: typeof InvitationStatus = InvitationStatus;

  invitation = input.required<InvitationBase>();
  lastSentAt = computed(() => {
    const invitation = this.invitation();
    return invitation.resentAt || invitation.createdAt;
  });
  translatedStatusKey = computed(() => `component.invitation.${this.invitation().status}`);
  statusColor = computed(() => {
    const status = this.invitation().status;
    switch (status) {
      case InvitationStatus.PENDING:
        return "warning";
      case InvitationStatus.ACCEPTED:
        return "tertiary";
      case InvitationStatus.REVOKED:
      case InvitationStatus.DENIED:
        return "error";
    }
  });
}
