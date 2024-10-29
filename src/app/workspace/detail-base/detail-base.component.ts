import { ChangeDetectionStrategy, Component } from "@angular/core";
import { BreadcrumbComponent } from "@tenzu/shared/components/breadcrumb";
import { PrimarySideNavComponent } from "@tenzu/shared/components/primary-side-nav";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "app-detail-base",
  standalone: true,
  imports: [BreadcrumbComponent, PrimarySideNavComponent, RouterOutlet],
  template: `
    <app-primary-side-nav>
      <app-breadcrumb></app-breadcrumb>
      <div class="mt-10"><router-outlet /></div>
    </app-primary-side-nav>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailBaseComponent {}
