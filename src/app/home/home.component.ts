import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MatToolbar } from "@angular/material/toolbar";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { RouterLink, RouterOutlet } from "@angular/router";
import { MatIconAnchor } from "@angular/material/button";
import { DomSanitizer } from "@angular/platform-browser";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { TranslocoDirective } from "@jsverse/transloco";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { UserStore } from "@tenzu/data/user";
import { AuthService } from "@tenzu/data/auth";
import { UserCardComponent } from "@tenzu/shared/components/user-card";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [
    AvatarComponent,
    MatToolbar,
    MatIcon,
    RouterLink,
    RouterOutlet,
    MatIconAnchor,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    TranslocoDirective,
    UserCardComponent,
  ],
  template: `
    <mat-toolbar role="banner" class="flex justify-between" *transloco="let t; prefix: 'home.navigation'">
      <a class="h-6" [routerLink]="'/'" [attr.aria-label]="t('go_home')">
        <mat-icon class="icon-full" svgIcon="logo-text"></mat-icon>
      </a>
      @if (userStore.myUser().username; as username) {
        <button>
          <app-avatar
            [matMenuTriggerFor]="userMenu"
            [name]="username"
            [color]="userStore.myUser().color"
            [rounded]="true"
          />
        </button>
        <mat-menu #userMenu="matMenu">
          <div class="px-3 py-1.5">
            <app-user-card
              [username]="userStore.myUser().email"
              [fullName]="userStore.myUser().fullName"
              [color]="userStore.myUser().color"
            ></app-user-card>
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
      }
    </mat-toolbar>
    <main>
      <router-outlet />
    </main>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  userStore = inject(UserStore);
  authService = inject(AuthService);
  iconRegistry = inject(MatIconRegistry);
  sanitizer = inject(DomSanitizer);
  constructor() {
    this.iconRegistry.addSvgIcon("logo-text", this.sanitizer.bypassSecurityTrustResourceUrl("logo-text-tenzu.svg"));
  }

  logout() {
    this.authService.logout();
  }
}
