import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatDivider } from "@angular/material/divider";

@Component({
  selector: "app-status-skeleton",
  standalone: true,
  imports: [MatDivider],
  template: `
    <div class="flex flex-row gap-x-4 items-center skeleton-container">
      <div class="grow flex flex-col gap-y-2">
        <div class="skeleton-line skeleton-line-lg"></div>
      </div>
      <div class="skeleton-icon-button"></div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusSkeletonComponent {}
