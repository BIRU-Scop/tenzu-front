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

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MembershipBase, Role } from "@tenzu/repository/membership";
import { MatIcon } from "@angular/material/icon";
import { TranslocoDirective } from "@jsverse/transloco";
import { PermissionsBase } from "@tenzu/repository/permission/permission.model";

@Component({
  selector: "app-membership-actions",
  imports: [MatIcon, MatIconButton, TranslocoDirective, MatButton],
  template: `
    <ng-container *transloco="let t">
      @if (isSelf()) {
        <button type="submit" mat-flat-button class="error-button">
          {{ t("component.membership.leave", { itemLabel: itemLabel() }) }}
        </button>
      } @else if (hasDeletePermission() && (membership().roleId !== ownerRole()?.id || userRole()?.isOwner)) {
        <button mat-icon-button [attr.aria-label]="t('component.membership.remove')">
          <mat-icon>close</mat-icon>
        </button>
      }
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "flex gap-2 justify-end w-full",
  },
})
export class MembershipActionsComponent {
  protected readonly PermissionsBase = PermissionsBase;

  itemLabel = input.required<string>();
  membership = input.required<MembershipBase>();
  hasDeletePermission = input.required<boolean>();
  isSelf = input(false);
  ownerRole = input<Role>();
  userRole = input<Role>();
}
