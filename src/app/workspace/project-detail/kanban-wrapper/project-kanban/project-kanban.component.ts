/*
 * Copyright (C) 2024 BIRU
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
import { BreadcrumbStore } from "@tenzu/data/breadcrumb";
import { Story } from "@tenzu/data/story";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatButton } from "@angular/material/button";
import { StatusCardComponent } from "./status-card/status-card.component";
import {
  EnterNameDialogComponent,
  NameDialogData,
} from "@tenzu/shared/components/enter-name-dialog/enter-name-dialog.component";
import { RelativeDialogService } from "@tenzu/utils/services/relative-dialog/relative-dialog.service";
import { animate, query, stagger, style, transition, trigger } from "@angular/animations";
import { ProjectKanbanService } from "./project-kanban.service";
import { StoryCardComponent } from "./story-card/story-card.component";
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from "@angular/cdk/drag-drop";
import { Status } from "@tenzu/data/status";
import { Step, WorkflowService } from "@tenzu/data/workflow";
import { Validators } from "@angular/forms";
import { ProjectKanbanSkeletonComponent } from "../../project-kanban-skeleton/project-kanban-skeleton.component";
import { toObservable } from "@angular/core/rxjs-interop";
import { filterNotNull } from "@tenzu/utils/functions/rxjs.operators";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { StoryService } from "@tenzu/data/story/story.service";
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from "@angular/cdk/scrolling";

@Component({
  selector: "app-project-kanban",
  imports: [
    MatButton,
    TranslocoDirective,
    StatusCardComponent,
    StoryCardComponent,
    CdkDropList,
    CdkDrag,
    CdkDropListGroup,
    ProjectKanbanSkeletonComponent,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
  ],
  template: `
    @let workflow = workflowService.selectedEntity();
    @let statuses = workflowService.statuses();
    <h1 class="mat-headline-small text-on-surface-variant">{{ workflow?.name }}</h1>
    @if (!storyService.isLoading()) {
      <ul
        class="grid grid-flow-col gap-8 kanban-viewport"
        *transloco="let t; prefix: 'workflow'"
        [@newStatusFlyIn]="statuses.length"
        cdkDropListGroup
      >
        @for (status of statuses; track status.id) {
          @let stories = storyService.groupedByStatus()[status.id];

          <li class="group w-64 flex flex-col overflow-hidden">
            <app-status-card
              (movedLeft)="moveStatus($index, Step.LEFT)"
              (movedRight)="moveStatus($index, Step.RIGHT)"
              [config]="{ showLeft: !$first, showRight: !$last }"
              [name]="status.name"
              [id]="status.id"
              [isEmpty]="!stories"
            />
            <ul
              [@newStoryFlyIn]="storyService.entities().length || 0"
              [id]="status.id"
              class="flex flex-col items-center gap-4 min-h-20 max-h-full overflow-y-auto py-2 dark:bg-surface-dim bg-surface-container rounded-b shadow-inner"
              cdkDropList
              [cdkDropListData]="status"
              (cdkDropListDropped)="drop($event)"
            >
              @if (stories && stories.length > 10) {
                <cdk-virtual-scroll-viewport [itemSize]="10" class="min-h-[100vh] w-full">
                  <li cdkDrag [cdkDragData]="story" class="w-60" *cdkVirtualFor="let story of stories">
                    <app-story-card
                      [ref]="story.ref"
                      [title]="story.title"
                      [users]="story.assignees"
                      [projectID]="story.projectId"
                    />
                  </li>
                </cdk-virtual-scroll-viewport>
              } @else {
                @for (story of stories; track story.ref) {
                  <li cdkDrag [cdkDragData]="story" class="w-60">
                    <app-story-card
                      [ref]="story.ref"
                      [title]="story.title"
                      [users]="story.assignees"
                      [projectID]="story.projectId"
                    />
                  </li>
                }
              }
            </ul>
            <button
              mat-stroked-button
              class="primary-button whitespace-nowrap shrink-0 mt-4"
              (click)="openCreateStory($event, status.id)"
            >
              {{ t("add_story") }}
            </button>
          </li>
        }
        <li>
          <button mat-stroked-button class="tertiary-button whitespace-nowrap w-64" (click)="openCreateStatus($event)">
            {{ t("add_status") }}
          </button>
        </li>
      </ul>
    } @else {
      <app-project-kanban-skeleton></app-project-kanban-skeleton>
    }
  `,
  styles: `
    .kanban-viewport {
      height: calc(100vh - var(--mat-toolbar-standard-height) - 16px - 1rem - 32px - 2rem - 12px - 16px);
      padding-bottom: 1.5px;
      width: fit-content;
      max-width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
    }
  `,
  animations: [
    trigger("newStoryFlyIn", [
      transition(":enter, * => 0, * => -1", []),
      transition(":increment", [
        query(
          ":enter",
          [
            style({ opacity: 0, height: 0 }),
            stagger(0, [animate("200ms ease-out", style({ opacity: 1, height: "*" }))]),
          ],
          { optional: true },
        ),
      ]),
    ]),
    trigger("newStatusFlyIn", [
      transition(":enter, * => 0, * => -1", []),
      transition(":increment", [
        query(
          ":enter",
          [
            style({ opacity: 0, width: 0 }),
            stagger(0, [animate("200ms ease-out", style({ opacity: 1, width: "192px" }))]),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectKanbanComponent {
  breadcrumbStore = inject(BreadcrumbStore);
  workflowService = inject(WorkflowService);
  storyService = inject(StoryService);
  projectKanbanService = inject(ProjectKanbanService);
  readonly relativeDialog = inject(RelativeDialogService);

  protected readonly Step = Step;

  constructor() {
    toObservable(this.workflowService.selectedEntity)
      .pipe(filterNotNull())
      .subscribe(async (workflow) => {
        this.breadcrumbStore.setSixthLevel({ label: workflow.name, doTranslation: false });
      });

    this.breadcrumbStore.setFifthLevel({ label: "workspace.general_title.kanban", link: "", doTranslation: true });
  }

  openCreateStory(event: MouseEvent, statusId: string): void {
    const data: NameDialogData = {
      label: "workflow.create_story.story_name",
      action: "workflow.create_story.create_story",
      placeholder: "workflow.create_story.name_placeholder",
      validators: [
        {
          type: "required",
          message: "workflow.create_story.name_required",
          validatorFn: Validators.required,
        },
        {
          type: "maxLength",
          message: "form_errors.max_length",
          translocoParams: { length: 500 },
          validatorFn: Validators.maxLength(500),
        },
      ],
    };
    const dialogRef = this.relativeDialog.open(EnterNameDialogComponent, event?.target, {
      ...matDialogConfig,
      relativeXPosition: "auto",
      relativeYPosition: "auto",
      data: data,
    });
    dialogRef.afterClosed().subscribe(async (name?: string) => {
      if (name) {
        await this.projectKanbanService.createStory({
          title: name,
          statusId: statusId,
        });
      }
    });
  }

  openCreateStatus(event: MouseEvent): void {
    const data: NameDialogData = {
      label: "workflow.create_status.status_name",
      action: "workflow.create_status.create_status",
      placeholder: "workflow.create_status.name_placeholder",
      validators: [
        {
          type: "required",
          message: "workflow.create_status.name_required",
          validatorFn: Validators.required,
        },
        {
          type: "maxLength",
          message: "form_errors.max_length",
          translocoParams: { length: 30 },
          validatorFn: Validators.maxLength(30),
        },
      ],
    };
    const dialogRef = this.relativeDialog.open(EnterNameDialogComponent, event?.target, {
      ...matDialogConfig,
      relativeXPosition: "left",
      data: data,
    });
    dialogRef.afterClosed().subscribe(async (name?: string) => {
      if (name) {
        const color = Math.floor(Math.random() * (8 - 1) + 1);
        await this.projectKanbanService.createStatus({
          name: name,
          color,
        });
      }
    });
  }

  async drop(event: CdkDragDrop<Status, Status, Story>) {
    const workflow = this.workflowService.selectedEntity();
    if (!workflow) {
      return;
    }
    if (event.previousContainer === event.container) {
      await this.storyService.dropStoryIntoSameStatus(event, workflow.projectId, workflow.slug);
    } else {
      await this.storyService.dropStoryBetweenStatus(event, workflow.projectId, workflow.slug);
    }
  }

  moveStatus(oldPosition: number, step: Step) {
    const selectedWorkspace = this.workflowService.selectedEntity();
    if (selectedWorkspace) {
      this.workflowService
        .reorder(selectedWorkspace.projectId, selectedWorkspace.slug, oldPosition, oldPosition + step)
        .then();
    }
  }
}
