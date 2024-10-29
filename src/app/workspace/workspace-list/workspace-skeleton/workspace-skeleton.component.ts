import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "app-workspace-skeleton",
  standalone: true,
  imports: [],
  template: `
    <div class="flex gap-4 items-center skeleton-container">
      <div class="skeleton-image shrink-0"></div>
      <div class="skeleton-line skeleton-line-lg"></div>
      <div class="skeleton-button"></div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceSkeletonComponent {}
