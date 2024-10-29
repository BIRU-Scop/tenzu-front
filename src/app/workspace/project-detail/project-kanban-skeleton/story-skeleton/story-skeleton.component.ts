import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "app-story-skeleton",
  standalone: true,
  imports: [],
  template: `
    <div class="flex flex-col gap-4 skeleton-container">
      <div class="grow flex flex-col gap-y-2">
        <div class="skeleton-line skeleton-line-md"></div>
        <div class="skeleton-line skeleton-line-md"></div>
      </div>
      <div class="flex flex-row">
        <div class="skeleton-avatar skeleton-avatar-heavy"></div>
        <div class="skeleton-avatar skeleton-avatar-medium"></div>
        <div class="skeleton-avatar skeleton-avatar-light"></div>
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorySkeletonComponent {}
