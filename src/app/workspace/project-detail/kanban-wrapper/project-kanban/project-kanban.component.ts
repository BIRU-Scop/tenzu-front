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

import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { BreadcrumbStore } from "@tenzu/repository/breadcrumb";
import { Story } from "@tenzu/repository/story";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatButton, MatIconButton } from "@angular/material/button";
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
import { Status } from "@tenzu/repository/status";
import { Step, WorkflowRepositoryService } from "@tenzu/repository/workflow";
import { Validators } from "@angular/forms";
import { ProjectKanbanSkeletonComponent } from "../../project-kanban-skeleton/project-kanban-skeleton.component";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { StoryRepositoryService } from "@tenzu/repository/story/story-repository.service";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatIcon } from "@angular/material/icon";
import { MatTooltip } from "@angular/material/tooltip";
import {
  DeleteWorkflowDialogComponent,
  FormData as DeleteWorkflowFormData,
} from "./delete-workflow-dialog/delete-workflow-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { NotificationService } from "@tenzu/utils/services/notification";
import { getStoryDetailUrl, getWorkflowUrl } from "@tenzu/utils/functions/urls";
import { Location } from "@angular/common";

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
    MatMenu,
    MatIcon,
    MatMenuTrigger,
    MatIconButton,
    MatTooltip,
    MatMenuItem,
  ],
  template: `
    @let workflow = workflowService.entityDetail();
    @let storySummaryEntityMap = storyService.entityMapSummary();
    @let statuses = workflowService.statuses();
    <div class="flex flex-row gap-x-2" *transloco="let t; prefix: 'workflow.edit_workflow'">
      <h1 class="mat-headline-small text-on-surface-variant">{{ workflow?.name }}</h1>
      <button
        mat-icon-button
        [attr.aria-label]="t('aria_label')"
        [matTooltip]="t('aria_label')"
        [matMenuTriggerFor]="workflowMenu"
      >
        <mat-icon>more_vert</mat-icon>
      </button>
      <mat-menu #workflowMenu="matMenu">
        <button mat-menu-item [attr.aria-label]="t('edit_name')" (click)="openEditWorkflow($event)">
          <mat-icon>edit</mat-icon>
          {{ t("edit_name") }}
        </button>
        <button
          mat-menu-item
          [attr.aria-label]="t('delete')"
          (click)="openDeleteWorkflowDialog()"
          [disabled]="onlyHasOneWorkflow()"
        >
          <mat-icon>delete</mat-icon>
          {{ t("delete") }}
        </button>
      </mat-menu>
    </div>
    @if (!storyService.isLoading()) {
      <ul
        class="grid grid-flow-col gap-8 kanban-viewport"
        *transloco="let t; prefix: 'workflow'"
        [@newStatusFlyIn]="statuses.length"
        cdkDropListGroup
      >
        @for (status of statuses; track status.id) {
          @let storiesRef = storyService.groupedByStatus()[status.id];

          <li class="group w-64 flex flex-col overflow-hidden">
            <app-status-card
              (movedLeft)="moveStatus($index, Step.LEFT)"
              (movedRight)="moveStatus($index, Step.RIGHT)"
              [config]="{ showLeft: !$first, showRight: !$last }"
              [name]="status.name"
              [id]="status.id"
              [isEmpty]="!storiesRef"
            />
            <ul
              [@newStoryFlyIn]="storyService.entitiesSummary().length || 0"
              [id]="status.id"
              class="flex flex-col items-center min-h-20 max-h-full overflow-y-auto dark:bg-surface-dim bg-surface-container rounded-b shadow-inner"
              cdkDropList
              [cdkDropListData]="status"
              (cdkDropListDropped)="drop($event)"
            >
              @for (storyRef of storiesRef; track storyRef; let idx = $index) {
                @let story = storySummaryEntityMap[storyRef];
                <li
                  id="story-{{ story.ref }}"
                  cdkDrag
                  [cdkDragData]="[story, idx]"
                  [attr.data-drag-index]="idx"
                  class="w-56 py-[8px]"
                >
                  <app-story-card class="w-56 h-[96px]" [story]="story" />
                </li>
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
      height: var(--tz-viewport-height);
      padding-bottom: 1.5px;
      width: fit-content;
      max-width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
    }
    .virtual-scroll {
      height: var(--tz-virtual-scroll-height);
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
  workflowService = inject(WorkflowRepositoryService);
  storyService = inject(StoryRepositoryService);
  projectKanbanService = inject(ProjectKanbanService);
  readonly relativeDialog = inject(RelativeDialogService);
  dialog = inject(MatDialog);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  notificationService = inject(NotificationService);
  location = inject(Location);
  onlyHasOneWorkflow = computed(() => {
    const project = this.projectKanbanService.projectService.entityDetail();
    if (!project) {
      return false;
    }
    const workflows = project.workflows;

    return workflows.length === 1;
  });

  protected readonly Step = Step;

  constructor() {
    this.breadcrumbStore.setPathComponent("projectKanban");
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

  async drop(event: CdkDragDrop<Status, Status, [Story, number]>) {
    const workflow = this.workflowService.entityDetail();
    if (!workflow) {
      return;
    }
    // we can't use event.indexes directly because of incompatibility between drag-drop and virtual-scroll
    // so we use workarounds
    const [, index] = event.item.data;
    event.previousIndex = index;
    const dataIndex = event.container.element.nativeElement
      .getElementsByClassName("cdk-drag")
      [event.currentIndex]?.getAttribute("data-drag-index");
    if (dataIndex) {
      event.currentIndex = Number(dataIndex);
    }
    await this.storyService.dropStoryIntoStatus(event, workflow.projectId, workflow.slug);
  }

  moveStatus(oldPosition: number, step: Step) {
    const selectedWorkspace = this.workflowService.entityDetail();
    if (selectedWorkspace) {
      this.workflowService.reorder(selectedWorkspace.id, oldPosition, oldPosition + step).then();
    }
  }

  openEditWorkflow(event: MouseEvent): void {
    const data: NameDialogData = {
      label: "workflow.edit_workflow_name.label",
      action: "workflow.edit_workflow_name.action",
      defaultValue: this.workflowService.entityDetail()?.name,
      validators: [
        {
          type: "required",
          message: "workflow.edit_workflow_name.name_required",
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
      relativeXPosition: "auto",
      data: data,
    });
    dialogRef.afterClosed().subscribe(async (name?: string) => {
      if (name) {
        const currentWorkflow = this.projectKanbanService.workflowService.entityDetail();
        if (!currentWorkflow) {
          return;
        }
        const editedWorkflow = await this.projectKanbanService.editSelectedWorkflow(currentWorkflow.id, { name: name });
        this.notificationService.success({
          title: "notification.workflow.renamed",
        });
        const storySelected = this.storyService.entityDetail();
        const currentUrl = this.router.url;
        const currentProjet = this.projectKanbanService.projectService.entityDetail();
        if (
          editedWorkflow &&
          currentProjet &&
          storySelected &&
          currentUrl === getStoryDetailUrl(currentProjet, storySelected.ref)
        ) {
          this.storyService.updateWorkflowStoryDetail(editedWorkflow);
        } else if (currentProjet && editedWorkflow) {
          this.location.replaceState(getWorkflowUrl(currentProjet, editedWorkflow.slug));
        }
      }
    });
  }

  openDeleteWorkflowDialog() {
    const selectedWorkflow = this.workflowService.entityDetail();
    if (selectedWorkflow) {
      const dialogRef = this.dialog.open(DeleteWorkflowDialogComponent, {
        ...matDialogConfig,
        data: {
          workflowName: selectedWorkflow.name,
          workflowId: selectedWorkflow.id,
        },
      });
      dialogRef.afterClosed().subscribe(async (formValue?: DeleteWorkflowFormData) => {
        if (formValue) {
          const moveToWorkflow: string | undefined =
            formValue.stories === "move" ? formValue.workflowTarget : undefined;
          const deletedData = await this.projectKanbanService.deletesSelectedWorkflow(moveToWorkflow);
          if (deletedData) {
            await this.router.navigate(["..", deletedData.redirectionSlug], { relativeTo: this.activatedRoute });
            this.notificationService.success({
              title: "notification.workflow.deleted",
              translocoTitleParams: { name: selectedWorkflow.name },
            });
          }
        }
      });
    } else {
      throw new Error("[WORKFLOW] Cannot delete workflow, missing SelectedWorkflow");
    }
  }
}
