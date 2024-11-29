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

import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { MatToolbar } from "@angular/material/toolbar";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { RouterLink, RouterOutlet } from "@angular/router";
import { DomSanitizer } from "@angular/platform-browser";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { TranslocoDirective } from "@jsverse/transloco";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { UserStore } from "@tenzu/data/user";
import { AuthService } from "@tenzu/data/auth";
import { UserCardComponent } from "@tenzu/shared/components/user-card";
import { toSignal } from "@angular/core/rxjs-interop";
import { darkModeOn$ } from "@tenzu/utils";
import { RelativeDialogService } from "@tenzu/utils/services";
import { MatIconButton } from "@angular/material/button";
import { NotificationsComponent } from "./notifications/notifications.component";
import { MatBadge } from "@angular/material/badge";
import { NotificationsComponentService } from "./notifications/notifications-component.service";
import { MatDivider } from "@angular/material/divider";

@Component({
  selector: "app-home",
  imports: [
    AvatarComponent,
    MatToolbar,
    MatIcon,
    RouterLink,
    RouterOutlet,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    TranslocoDirective,
    UserCardComponent,
    MatIconButton,
    MatBadge,
    MatDivider,
  ],
  template: `
    <mat-toolbar role="banner" class="flex" *transloco="let t; prefix: 'home.navigation'">
      <a class="h-6" [routerLink]="'/'" [attr.aria-label]="t('go_home')">
        <mat-icon class="icon-full" [svgIcon]="!darkModeOn() ? 'logo-text' : 'logo-text-dark'"></mat-icon>
      </a>
      <div class="mx-auto"></div>
      <button mat-icon-button (click)="openNotificationDialog($event)">
        <mat-icon
          [matBadge]="notificationsComponentService.count.unread()"
          [matBadgeHidden]="!notificationsComponentService.count.unread()"
          >notifications</mat-icon
        >
      </button>
      <mat-divider class="h-1/2 !mx-2" [vertical]="true"></mat-divider>
      @let myUser = userStore.myUser();

      <button>
        <app-avatar [matMenuTriggerFor]="userMenu" [name]="myUser.fullName" [color]="myUser.color" [rounded]="true" />
      </button>
      <mat-menu #userMenu="matMenu">
        <div class="px-3 py-1.5">
          <app-user-card [username]="myUser.email" [fullName]="myUser.fullName" [color]="myUser.color"></app-user-card>
        </div>
        <button mat-menu-item [routerLink]="'settings'" [attr.aria-label]="t('settings')">
          <mat-icon>settings</mat-icon>
          <span>{{ t("settings") }}</span>
        </button>
        <button mat-menu-item (click)="logout()">
          <mat-icon>logout</mat-icon>
          <span>{{ t("logout") }}</span>
        </button>
      </mat-menu>
    </mat-toolbar>
    <main>
      <router-outlet />
    </main>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomeComponent implements OnInit {
  userStore = inject(UserStore);
  authService = inject(AuthService);
  iconRegistry = inject(MatIconRegistry);
  sanitizer = inject(DomSanitizer);
  darkModeOn = toSignal(darkModeOn$);
  relativeDialog = inject(RelativeDialogService);
  notificationsComponentService = inject(NotificationsComponentService);

  constructor() {
    this.iconRegistry.addSvgIcon("logo-text", this.sanitizer.bypassSecurityTrustResourceUrl("logo-text-tenzu.svg"));
    this.iconRegistry.addSvgIcon(
      "logo-text-dark",
      this.sanitizer.bypassSecurityTrustResourceUrl("logo-text-tenzu-dark.svg"),
    );
  }
  async ngOnInit() {
    await this.notificationsComponentService.getCount();
  }

  async logout() {
    await this.authService.logout();
  }
  openNotificationDialog(even: MouseEvent) {
    this.relativeDialog.open(NotificationsComponent, even?.target, {
      relativeXPosition: "left",
      relativeYPosition: "below",
    });
  }
}
