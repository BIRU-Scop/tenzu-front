/*
 * Copyright (C) 2024-2025 BIRU
 *
 * This file is part of Tenzu.
 *
 * Tenzu is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * You can contact BIRU at ask@biru.sh
 *
 */

import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ProjectKanbanComponent } from "./project-kanban/project-kanban.component";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import StoryDetailComponent from "./story-detail/story-detail.component";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { ActivatedRoute, Router } from "@angular/router";
import { WorkflowRepositoryService } from "@tenzu/repository/workflow";
import { KanbanWrapperService } from "./kanban-wrapper.service";
import { toObservable } from "@angular/core/rxjs-interop";
import { filterNotNull } from "@tenzu/utils/functions/rxjs.operators";
import { switchMap } from "rxjs/operators";
import { MatDrawer, MatDrawerContainer } from "@angular/material/sidenav";
import { BreadcrumbStore } from "@tenzu/repository/breadcrumb";

@Component({
  selector: "app-story-detail-dialog",
  standalone: true,
  imports: [StoryDetailComponent],
  template: `
    <app-story-detail class="overflow-hidden" [canBeClosed]="true" (closed)="dialogRef.close()"></app-story-detail>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryDetailDialogComponent {
  readonly dialogRef = inject(MatDialogRef<StoryDetailDialogComponent>);
}

@Component({
  selector: "app-kanban-wrapper",
  standalone: true,
  imports: [ProjectKanbanComponent, StoryDetailComponent, MatDrawer, MatDrawerContainer],
  template: ` @let storyView = kanbanWrapperService.storyView();
    @switch (storyView) {
      @case ("kanban") {
        <app-project-kanban></app-project-kanban>
      }
      @case ("fullView") {
        @if (this.kanbanWrapperService.storyRepositoryService.entityDetail()) {
          <app-story-detail></app-story-detail>
        } @else {
          <app-project-kanban></app-project-kanban>
        }
      }
      @case ("side-view") {
        <mat-drawer-container>
          <app-project-kanban></app-project-kanban>
          <mat-drawer #drawer mode="side" [opened]="kanbanWrapperService.isOpenedSideview()" position="end">
            <app-story-detail [canBeClosed]="true" (closed)="navigateToKanban()"></app-story-detail>
          </mat-drawer>
        </mat-drawer-container>
      }
    }`,
  styles: `
    .mat-drawer.mat-drawer-side.mat-drawer-end {
      width: 60%;
      padding-bottom: 0;
      padding-left: 16px;
      padding-right: 16px;
      padding-top: 12px;
      border-width: 1px;
      border-style: solid;
      border-color: var(--mat-sys-outline);
      border-left-width: 2px;
      border-right-width: 0;
      box-shadow: -1px 1px 1px rgba(0, 0, 0, 0.3);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class KanbanWrapperComponent {
  dialog = inject(MatDialog);
  router = inject(Router);
  kanbanWrapperService = inject(KanbanWrapperService);
  workflowService = inject(WorkflowRepositoryService);
  activatedRoute = inject(ActivatedRoute);
  breadcrumbStore = inject(BreadcrumbStore);

  constructor() {
    const storyView$ = toObservable(this.kanbanWrapperService.storyView);
    toObservable(this.kanbanWrapperService.storyRepositoryService.entityDetail)
      .pipe(
        filterNotNull(),
        switchMap(() => storyView$),
      )
      .subscribe((storyView) => {
        this.setUpBreadcrumbForFullView(storyView);
        if (storyView == "side-view") {
          const storyDetail = this.kanbanWrapperService.storyRepositoryService.entityDetail();
          if (storyDetail) {
            this.kanbanWrapperService.setOpenedSideview(storyDetail);
          }
        } else {
          this.kanbanWrapperService.closeOpenedSideview();
        }
        if (storyView == "kanban" && this.kanbanWrapperService.firstOpened()) {
          this.kanbanWrapperService.setFirstOpened(false);
          const dialogRef = this.dialog.open(StoryDetailDialogComponent, {
            ...matDialogConfig,
            width: "80vw",
            height: "80vh",
            maxWidth: "80vw",
          });
          dialogRef.afterClosed().subscribe(() => {
            this.kanbanWrapperService.setFirstOpened(true);
            if (this.kanbanWrapperService.storyView() === "kanban") {
              this.router
                .navigate(["../..", "kanban", this.workflowService.entityDetail()?.slug], {
                  relativeTo: this.activatedRoute,
                })
                .then(() => this.kanbanWrapperService.storyRepositoryService.resetEntityDetail());
            }
          });
        }
      });
  }

  setUpBreadcrumbForFullView(storyView: string): void {
    if (storyView === "fullView") {
      this.breadcrumbStore.setPathComponent("storyDetail");
    }
  }

  navigateToKanban(): void {
    this.kanbanWrapperService.closeOpenedSideview();
    this.router
      .navigate(["../..", "kanban", this.workflowService.entityDetail()?.slug], {
        relativeTo: this.activatedRoute,
      })
      .then(() => this.kanbanWrapperService.storyRepositoryService.resetEntityDetail());
  }
}
