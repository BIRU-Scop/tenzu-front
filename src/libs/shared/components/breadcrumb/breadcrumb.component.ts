import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { UpperCasePipe } from "@angular/common";
import { BreadcrumbStore } from "@tenzu/data/breadcrumb";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: "app-breadcrumb",
  standalone: true,
  imports: [RouterLink, UpperCasePipe, TranslocoDirective],
  template: ` <div *transloco="let t" class="mat-label-medium text-neutral-40 flex flex-wrap gap-1">
    @for (breadCrumb of breadcrumbStore.breadCrumbConfig(); track breadCrumb.label; let last = $last) {
      @if (!last) {
        <a [routerLink]="breadCrumb.link">
          @if (breadCrumb.doTranslation) {
            {{ t(breadCrumb.label) | uppercase }}
          } @else {
            {{ breadCrumb.label | uppercase }}
          }
        </a>
        /
      } @else {
        @if (breadCrumb.doTranslation) {
          {{ t(breadCrumb.label) | uppercase }}
        } @else {
          {{ breadCrumb.label | uppercase }}
        }
      }
    }
  </div>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent {
  breadcrumbStore = inject(BreadcrumbStore);
}
