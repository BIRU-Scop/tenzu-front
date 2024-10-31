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

import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { MatTooltip } from "@angular/material/tooltip";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { UserMinimal, UserStore } from "@tenzu/data/user";

@Component({
  selector: "app-avatar-list",
  standalone: true,
  imports: [MatTooltip, AvatarComponent],
  template: `
    <div class="flex flex-row">
      @for (user of filteredUsernames().slice(0, userOverflowThreshold()); track user.fullName) {
        <app-avatar
          [matTooltip]="user.fullName"
          [name]="user.fullName"
          [rounded]="true"
          [color]="user.color"
        ></app-avatar>
      }
      @if (filteredUsernames().length > userOverflowThreshold()) {
        <app-avatar
          [matTooltip]="hiddenUsersNames()"
          [name]="'+ ' + (filteredUsernames().length - userOverflowThreshold())"
          [rounded]="true"
          [color]="0"
        ></app-avatar>
      }
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarListComponent {
  userStore = inject(UserStore);
  userOverflowThreshold = input<number>(3);
  users = input<UserMinimal[]>([]);
  prioritizeCurrentUser = input<boolean>(false);

  filteredUsernames = computed(() => {
    const users = this.users();
    const usernamePriority = this.prioritizeCurrentUser() ? this.userStore.myUser().username : "";
    users.sort((a, b) => {
      if (a.username === usernamePriority) {
        return -1;
      }
      if (b.username === usernamePriority) {
        return 1;
      }
      return 0;
    });
    return [...users];
  });

  hiddenUsersNames = computed(() => {
    return this.filteredUsernames()
      .slice(this.userOverflowThreshold(), this.filteredUsernames().length)
      .map((user) => user.fullName)
      .join(", ");
  });
}
