import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { MatTabLink, MatTabNav, MatTabNavPanel } from "@angular/material/tabs";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [RouterOutlet, MatTabNavPanel, MatTabNav, MatTabLink, RouterLinkActive, RouterLink, TranslocoDirective],
  template: `<nav
      mat-tab-nav-bar
      mat-stretch-tabs="false"
      mat-align-tabs="center"
      [tabPanel]="tabPanel"
      *transloco="let t; prefix: 'settings'"
    >
      @for (link of links; track link) {
        <a
          mat-tab-link
          [active]="routerLinkActive.isActive"
          [routerLink]="link.href"
          routerLinkActive
          #routerLinkActive="routerLinkActive"
        >
          {{ t(link.name) }}
        </a>
      }
    </nav>
    <mat-tab-nav-panel #tabPanel class="grid grid-cols-1 place-items-center py-4"
      ><router-outlet
    /></mat-tab-nav-panel>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  baseUrl = `/settings/`;
  links = [
    {
      name: "navigation.profile",
      href: `${this.baseUrl}/profile`,
    },
    {
      name: "navigation.security",
      href: `${this.baseUrl}/security`,
    },
    {
      name: "navigation.delete",
      href: `${this.baseUrl}/delete`,
    },
  ];
}
