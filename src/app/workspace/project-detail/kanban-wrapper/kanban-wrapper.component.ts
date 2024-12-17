import { ChangeDetectionStrategy, Component, inject, OnDestroy } from "@angular/core";
import { ProjectKanbanComponent } from "./project-kanban/project-kanban.component";
import { MatDialog } from "@angular/material/dialog";
import StoryDetailComponent from "./story-detail/story-detail.component";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { ActivatedRoute, Router } from "@angular/router";
import { WorkflowService } from "@tenzu/data/workflow";
import { KanbanWrapperService } from "./kanban-wrapper.service";
import { toObservable } from "@angular/core/rxjs-interop";
import { filterNotNull } from "@tenzu/utils/functions/rxjs.operators";
import { switchMap } from "rxjs/operators";

@Component({
  selector: "app-kanban-wrapper",
  standalone: true,
  imports: [ProjectKanbanComponent, StoryDetailComponent],
  template: ` @let storyView = kanbanWrapperService.storyView();
    @switch (storyView) {
      @case ("kanban") {
        <app-project-kanban></app-project-kanban>
      }
      @case ("fullView") {
        @if (this.kanbanWrapperService.storyService.selectedEntity()) {
          <app-story-detail></app-story-detail>
        } @else {
          <app-project-kanban></app-project-kanban>
        }
      }
      @case ("side-view") {
        <div class="flex flex-row">
          <app-project-kanban></app-project-kanban>
          @if (this.kanbanWrapperService.storyService.selectedEntity()) {
            <app-story-detail></app-story-detail>
          }
        </div>
      }
    }`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class KanbanWrapperComponent implements OnDestroy {
  dialog = inject(MatDialog);
  router = inject(Router);
  kanbanWrapperService = inject(KanbanWrapperService);
  workflowService = inject(WorkflowService);
  activatedRoute = inject(ActivatedRoute);
  constructor() {
    const storyView$ = toObservable(this.kanbanWrapperService.storyView);
    toObservable(this.kanbanWrapperService.storyService.selectedEntity)
      .pipe(
        filterNotNull(),
        switchMap(() => storyView$),
      )
      .subscribe((storyView) => {
        if (storyView == "kanban" && this.kanbanWrapperService.firstOpened()) {
          this.kanbanWrapperService.setFirstOpened(false);
          const dialogRef = this.dialog.open(StoryDetailComponent, {
            ...matDialogConfig,
            width: "80vw",
            height: "80vh",
            maxWidth: "80vw",
            panelClass: "test",
          });
          dialogRef.afterClosed().subscribe(() => {
            this.kanbanWrapperService.setFirstOpened(true);
            if (this.kanbanWrapperService.storyView() === "kanban") {
              this.router
                .navigate(["../..", "kanban", this.workflowService.selectedEntity()?.slug], {
                  relativeTo: this.activatedRoute,
                })
                .then(() => this.kanbanWrapperService.storyService.resetSelectedEntity());
            }
          });
        }
      });
  }
  ngOnDestroy(): void {
    console.log("KanbanWrapperComponent.ngOnDestroy");
    this.kanbanWrapperService.storyService.fullReset();
  }
}
