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

import { ChangeDetectionStrategy, Component, computed, inject, input, output, viewChild } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatFormField } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { TranslocoDirective } from "@jsverse/transloco";
import { toObservable } from "@angular/core/rxjs-interop";
import { EditorComponent } from "@tenzu/shared/components/editor";
import { UserCardComponent } from "@tenzu/shared/components/user-card";
import { DatePipe } from "@angular/common";
import { MatIcon } from "@angular/material/icon";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatTableModule } from "@angular/material/table";
import { AvatarListComponent } from "@tenzu/shared/components/avatar/avatar-list/avatar-list.component";
import { ConfirmDirective } from "@tenzu/directives/confirm";
import { StoryDetailService } from "./story-detail.service";
import { AssignDialogComponent } from "@tenzu/shared/components/assign-dialog/assign-dialog.component";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { ProjectKanbanService } from "../project-kanban/project-kanban.service";
import { MatDivider } from "@angular/material/divider";
import { NotificationService } from "@tenzu/utils/services/notification";
import { RelativeDialogService } from "@tenzu/utils/services/relative-dialog/relative-dialog.service";
import { MatTooltip } from "@angular/material/tooltip";
import { filterNotNull } from "@tenzu/utils/functions/rxjs.operators";
import { WorkspaceRepositoryService } from "@tenzu/repository/workspace";
import { StoryDetailMenuComponent } from "./story-detail-menu/story-detail-menu.component";
import { ProjectMembershipRepositoryService } from "@tenzu/repository/project-membership";
import { StoryDetailAttachementsComponent } from "./story-detail-attachements/story-detail-attachements.component";
import { StoryStatusComponent } from "./story-status/story-status.component";

@Component({
  selector: "app-story-detail",
  imports: [
    UserCardComponent,
    MatButton,
    MatFormField,
    MatInput,
    ReactiveFormsModule,
    TranslocoDirective,
    EditorComponent,
    DatePipe,
    MatIcon,
    MatExpansionModule,
    MatIcon,
    ConfirmDirective,
    MatTableModule,
    MatIconButton,
    AvatarListComponent,
    MatDivider,
    MatTooltip,
    StoryDetailMenuComponent,
    StoryDetailAttachementsComponent,
    StoryStatusComponent,
  ],
  template: `
    <ng-container *transloco="let t; prefix: 'workflow.detail_story'">
      @if (this.selectedStory(); as story) {
        <app-story-detail-menu
          [inputStory]="story"
          [canBeClosed]="canBeClosed()"
          (closed)="closed.emit()"
        ></app-story-detail-menu>
        <div class="flex flex-row gap-8">
          <div class="basis-2/3 flex flex-col gap-y-6">
            <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-y-5">
              <mat-form-field appearance="fill" class="title-field">
                <input [attr.aria-label]="t('title')" matInput data-testid="title-input" formControlName="title" />
              </mat-form-field>
              <app-editor #editorContainer [data]="story.description"></app-editor>
              <div class="flex flex-row gap-2">
                <button class="tertiary-button" mat-flat-button type="submit">{{ t("save") }}</button>
                <button class="secondary-button" mat-flat-button type="button" (click)="cancel()">
                  {{ t("cancel") }}
                </button>
              </div>
            </form>
            <mat-divider></mat-divider>
            @let projectDetail = projectKanbanService.projectService.entityDetail();
            @if (projectDetail && story) {
              <app-story-detail-attachements
                [projectDetail]="projectDetail"
                [storyDetail]="story"
              ></app-story-detail-attachements>
            }
          </div>
          <div
            class="col-span-2 flex flex-col gap-4 border-l border-y-0 border-r-0 border-solid border-outline pl-8 pt-4"
          >
            <div class="grid grid-cols-2 gap-y-4 content-start mb-2">
              <span class="text-on-surface-variant mat-label-medium self-center">{{ t("created_by") }}</span>
              <app-user-card
                [fullName]="story.createdBy?.fullName ? story.createdBy?.fullName : t('former_user')"
                [username]="story.createdAt | date: 'short'"
                [color]="story.createdBy?.color || 0"
              ></app-user-card>

              <app-story-status [storyDetail]="story"></app-story-status>
              <span class="text-on-surface-variant mat-label-medium self-center">{{ t("assigned_to") }}</span>
              @let _assignees = assignees();
              @if (_assignees.length > 0) {
                <button type="button" (click)="openAssignStoryDialog($event)" [attr.aria-label]="t('edit_assignees')">
                  <app-avatar-list [users]="_assignees" [prioritizeCurrentUser]="true"></app-avatar-list>
                </button>
              } @else {
                <button
                  mat-icon-button
                  type="button"
                  (click)="openAssignStoryDialog($event)"
                  [attr.aria-label]="t('add_assignees')"
                  [matTooltip]="t('add_assignees')"
                >
                  <mat-icon>person_add</mat-icon>
                </button>
              }
            </div>
            <mat-divider></mat-divider>
            <button
              type="button"
              class="col-span-2"
              mat-icon-button
              appConfirm
              [data]="{
                deleteAction: true,
                title: t('confirm_delete_story'),
                message: t('confirm_delete_story_message'),
              }"
              (popupConfirm)="onDelete()"
              [attr.aria-label]="t('delete_story')"
              [matTooltip]="t('delete_story')"
            >
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </div>
      }
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StoryDetailComponent {
  storyDetailService = inject(StoryDetailService);
  workflowService = this.storyDetailService.workflowService;
  workspaceService = inject(WorkspaceRepositoryService);
  storyService = this.storyDetailService.storyService;
  projectMembershipService = inject(ProjectMembershipRepositoryService);
  notificationService = inject(NotificationService);
  projectKanbanService = inject(ProjectKanbanService);
  relativeDialog = inject(RelativeDialogService);
  fb = inject(FormBuilder);
  canBeClosed = input(false);
  closed = output<void>();
  selectedStory = this.storyService.entityDetail;
  editor = viewChild.required<EditorComponent>("editorContainer");
  form = this.fb.nonNullable.group({
    title: ["", Validators.required],
  });

  constructor() {
    toObservable(this.selectedStory)
      .pipe(filterNotNull())
      .subscribe(async (value) => {
        this.form.setValue({ title: value?.title || "" });
        if (this.workflowService.entityDetail()?.id !== value.workflowId) {
          await this.workflowService.getBySlugRequest(value.workflow);
        }
      });
  }

  assignees = computed(() => {
    const teamMembers = this.projectMembershipService.members();
    return this.selectedStory()?.assigneeIds.map((userId) => teamMembers[userId]) || [];
  });

  async submit() {
    const description = await this.editor().save();
    const data = { ...this.form.getRawValue(), description: JSON.stringify(description) };
    await this.storyDetailService.patchSelectedStory(data);
    this.notificationService.success({ title: "notification.action.changes_saved" });
  }

  async cancel() {
    await this.editor().cancel();
    this.form.setValue({ title: this.selectedStory()?.title || "" });
  }

  async onDelete() {
    await this.storyDetailService.deleteSelectedStory();
    this.closed.emit();
  }

  openAssignStoryDialog(event: MouseEvent): void {
    const story = this.selectedStory();
    const teamMembers = Object.values(this.projectMembershipService.members());
    if (story) {
      const dialogRef = this.relativeDialog.open(AssignDialogComponent, event?.target, {
        ...matDialogConfig,
        relativeXPosition: "left",
        data: {
          assignees: this.assignees(),
          teamMembers: teamMembers,
        },
      });
      dialogRef.componentInstance.memberAssigned.subscribe((user) => {
        this.projectKanbanService.assignStory(user, story.projectId, story.ref).then();
      });
      dialogRef.componentInstance.memberUnassigned.subscribe((user) =>
        this.projectKanbanService.removeAssignStory(user, story.projectId, story.ref),
      );
    }
  }
}
