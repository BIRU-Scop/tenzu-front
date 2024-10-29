import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "app-card-skeleton",
  standalone: true,
  imports: [],
  template: `
    <div class="flex flex-col gap-4 skeleton-container">
      <div class="flex gap-4">
        <div class="skeleton-image"></div>
        <div class="grow flex flex-col gap-1 justify-center">
          <div class="skeleton-line skeleton-line-md"></div>
          <div class="skeleton-line skeleton-line-md"></div>
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <div class="skeleton-line skeleton-line-sm"></div>
        <div class="skeleton-line skeleton-line-sm"></div>
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardSkeletonComponent {}
