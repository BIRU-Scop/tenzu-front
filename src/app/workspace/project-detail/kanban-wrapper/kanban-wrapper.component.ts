/*
 * Copyright (C) 2024-2026 BIRU
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

import { ChangeDetectionStrategy, Component, effect, inject, input, untracked } from "@angular/core";
import { ProjectKanbanComponent } from "./project-kanban/project-kanban.component";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import StoryDetailComponent from "./story-detail/story-detail.component";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { ActivatedRoute, Router } from "@angular/router";
import { KanbanWrapperService } from "./kanban-wrapper.service";
import { MatDrawer, MatDrawerContainer } from "@angular/material/sidenav";
import { BreadcrumbStore } from "@tenzu/repository/breadcrumb";
import { HttpErrorResponse } from "@angular/common/http";

/**
 * Dialog component that displays story details in a modal view.
 *
 * This component wraps the StoryDetailComponent in a Material dialog
 * with a closable interface.
 */
@Component({
  selector: "app-story-detail-dialog",
  standalone: true,
  imports: [StoryDetailComponent],
  template: ` <app-story-detail class="overflow-auto" [canBeClosed]="true" (closed)="dialogRef.close()" /> `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryDetailDialogComponent {
  /** Reference to the Material dialog instance */
  readonly dialogRef = inject(MatDialogRef<StoryDetailDialogComponent>);
}

/**
 * Wrapper component that manages different view modes for the Kanban board and story details.
 *
 * This component handles three main view modes:
 * - Kanban view: Shows only the Kanban board
 * - Modal view: Shows the Kanban board with story details in a modal dialog
 * - Side view: Shows the Kanban board with story details in a side drawer
 * - Full view: Shows only the story details in full screen
 *
 * The component also manages data loading for workflows, stories, and comments,
 * with proper error handling and navigation to 404 page when resources are not found.
 */
@Component({
  selector: "app-kanban-wrapper",
  standalone: true,
  imports: [ProjectKanbanComponent, StoryDetailComponent, MatDrawer, MatDrawerContainer],
  template: `
    @if (kanbanWrapperService.isKanbanView() || kanbanWrapperService.isModalViewOpen()) {
      <app-project-kanban />
    } @else if (kanbanWrapperService.isFullViewOpen()) {
      <app-story-detail />
    } @else if (kanbanWrapperService.isSideViewOpen()) {
      <mat-drawer-container>
        <app-project-kanban />
        <mat-drawer #drawer mode="side" [opened]="kanbanWrapperService.isSideViewOpen()" position="end">
          <app-story-detail [canBeClosed]="true" (closed)="navigateToKanban()" />
        </mat-drawer>
      </mat-drawer-container>
    }
  `,
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
  projectId = input<string | undefined>(undefined);
  storyRef = input<number | undefined>(undefined);
  workflowSlug = input<string | undefined>(undefined);

  dialog = inject(MatDialog);
  router = inject(Router);
  kanbanWrapperService = inject(KanbanWrapperService);
  activatedRoute = inject(ActivatedRoute);
  breadcrumbStore = inject(BreadcrumbStore);

  dialogRef: MatDialogRef<StoryDetailDialogComponent, unknown> | undefined = undefined;

  constructor() {
    // Effect: Load story details and comments when story ref or project ID changes
    effect(() => {
      const storyRef = this.storyRef();
      const projectId = this.projectId();
      const isFullViewOpen = this.kanbanWrapperService.isFullViewOpen();
      if (!storyRef || !projectId) return;
      untracked(async () => {
        try {
          await this.kanbanWrapperService.loadStoryDetail({ projectId, storyRef, isFullViewOpen });
          await this.kanbanWrapperService.loadStoryComments({ projectId, storyRef });
        } catch (error) {
          if (error instanceof HttpErrorResponse && (error.status === 404 || error.status === 422)) {
            this.router.navigate(["/404"]).then();
          }
          throw error;
        }
      }).then();
    });

    // Effect: Load workflow and stories when project ID or workflow slug changes
    effect(() => {
      const projectId = this.projectId();
      const workflowSlug = this.workflowSlug();
      if (!projectId || !workflowSlug) return;
      untracked(async () => {
        try {
          await this.kanbanWrapperService.loadWorkflowAndStories({ projectId, workflowSLug: workflowSlug });
        } catch (error) {
          if (error instanceof HttpErrorResponse && (error.status === 404 || error.status === 422)) {
            this.router.navigate(["/404"]).then();
          }
          throw error;
        }
      }).then();
    });

    // Effect: Handle display mode changes (close modal when switching modes, update breadcrumb)
    effect(() => {
      const storyDisplayMode = this.kanbanWrapperService.storyDisplayMode();

      untracked(() => {
        if (storyDisplayMode !== "modalView" && this.dialogRef) {
          this.dialogRef.close();
        }
        this.setUpBreadcrumbForFullView(storyDisplayMode);
      });
    });

    // Effect: Open story detail dialog when modal view mode is activated
    effect(() => {
      const isModalViewOpen = this.kanbanWrapperService.isModalViewOpen();
      if (isModalViewOpen && !this.dialogRef) {
        this.createStoryDetailDialog();
      }
    });
  }

  /**
   * Creates and opens a Material dialog to display story details.
   * Sets up the dialog with proper dimensions and handles cleanup when closed.
   */
  createStoryDetailDialog(): void {
    const dialogRef = this.dialog.open(StoryDetailDialogComponent, {
      ...matDialogConfig,
      width: "80vw",
      height: "80vh",
      maxWidth: "80vw",
    });
    dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = undefined;
      if (this.kanbanWrapperService.storyDisplayMode() === "modalView") {
        this.navigateToKanban();
      }
    });
    this.dialogRef = dialogRef;
  }

  /**
   * Updates the breadcrumb navigation when switching to full view mode.
   *
   * @param storyView - The current story display mode
   */
  setUpBreadcrumbForFullView(storyView: string): void {
    if (storyView === "fullView") {
      this.breadcrumbStore.setPathComponent("storyDetail");
    }
  }

  /**
   * Navigates back to the Kanban board view and closes the side drawer.
   * Resets the story detail state after navigation completes.
   */
  navigateToKanban(): void {
    this.router
      .navigate(this.getKanbanRoute(), {
        relativeTo: this.activatedRoute,
      })
      .then(() => this.kanbanWrapperService.storyRepositoryService.resetEntityDetail());
  }

  /**
   * Constructs the route path array for navigating back to the Kanban board.
   *
   * @returns Array of route segments including the workflow slug
   */
  private getKanbanRoute(): (string | undefined)[] {
    return ["../..", "kanban", this.kanbanWrapperService.workflowRepositoryService.entityDetail()?.slug];
  }
}
