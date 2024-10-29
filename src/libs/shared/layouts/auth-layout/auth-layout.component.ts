import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-auth-layout",
  standalone: true,
  imports: [RouterOutlet, MatIcon],
  template: `
    <main class="h-dvh flex flex-col items-center">
      <div class="w-[200px] mt-8"><mat-icon class="icon-full" svgIcon="logo-full"></mat-icon></div>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent {
  iconRegistry = inject(MatIconRegistry);
  sanitizer = inject(DomSanitizer);
  constructor() {
    this.iconRegistry.addSvgIcon("logo-full", this.sanitizer.bypassSecurityTrustResourceUrl("logo-full-tenzu.svg"));
  }
}
