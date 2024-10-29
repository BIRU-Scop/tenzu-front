import { ChangeDetectionStrategy, Component } from "@angular/core";
import { StatusSkeletonComponent } from "./status-skeleton/status-skeleton.component";
import { StorySkeletonComponent } from "./story-skeleton/story-skeleton.component";

@Component({
  selector: "app-project-kanban-skeleton",
  standalone: true,
  imports: [StatusSkeletonComponent, StorySkeletonComponent],
  template: `
    <div class="flex flex-row gap-x-8">
      <div class="flex flex-col w-64 shrink-0">
        <app-status-skeleton></app-status-skeleton>
        <app-story-skeleton></app-story-skeleton>
      </div>
      <div class="flex flex-col w-64 shrink-0">
        <app-status-skeleton></app-status-skeleton>
        <app-story-skeleton></app-story-skeleton>
      </div>
      <div class="flex flex-col w-64 shrink-0">
        <app-status-skeleton></app-status-skeleton>
        <app-story-skeleton></app-story-skeleton>
      </div>
      <div class="flex flex-col w-64 shrink-0">
        <app-status-skeleton></app-status-skeleton>
        <app-story-skeleton></app-story-skeleton>
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectKanbanSkeletonComponent {}
