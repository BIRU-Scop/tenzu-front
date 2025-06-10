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

import { ChangeDetectionStrategy, Component, inject, input, output, viewChild } from "@angular/core";
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
import { ConfirmDirective } from "@tenzu/directives/confirm";
import { StoryDetailFacade } from "./story-detail.facade";
import { ProjectKanbanService } from "../project-kanban/project-kanban.service";
import { MatDivider } from "@angular/material/divider";
import { NotificationService } from "@tenzu/utils/services/notification";
import { MatTooltip } from "@angular/material/tooltip";
import { filterNotNull } from "@tenzu/utils/functions/rxjs.operators";
import { StoryDetailMenuComponent } from "./story-detail-menu/story-detail-menu.component";
import { StoryDetailAttachmentsComponent } from "./story-detail-attachements/story-detail-attachments.component";
import { StoryStatusComponent } from "./story-status/story-status.component";
import { StoryAssigneeComponent } from "./story-assignee/story-assignee.component";
import { ProjectRepositoryService } from "@tenzu/repository/project";
import { HasPermissionDirective } from "@tenzu/directives/permission.directive";
import { ProjectPermissions } from "@tenzu/repository/permission/permission.model";
import { hasEntityRequiredPermission } from "@tenzu/repository/permission/permission.service";

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
    MatDivider,
    MatTooltip,
    StoryDetailMenuComponent,
    StoryDetailAttachmentsComponent,
    StoryStatusComponent,
    StoryAssigneeComponent,
    HasPermissionDirective,
  ],
  template: `
    @let project = projectRepositoryService.entityDetail();
    @if (project) {
      <ng-container
        *appHasPermission="{
          actualEntity: project,
          requiredPermission: ProjectPermissions.VIEW_STORY,
        }"
      >
        @let hasModifyPermission =
          hasEntityRequiredPermission({
            requiredPermission: ProjectPermissions.MODIFY_STORY,
            actualEntity: project,
          });
        <ng-container *transloco="let t; prefix: 'workflow.detail_story'">
          @if (this.selectedStory(); as story) {
            <app-story-detail-menu
              [inputStory]="story"
              [canBeClosed]="canBeClosed()"
              [hasModifyPermission]="hasModifyPermission"
              (closed)="closed.emit()"
            ></app-story-detail-menu>
            <div class="flex flex-row gap-8">
              <div class="basis-2/3 flex flex-col gap-y-6">
                <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-y-5">
                  <mat-form-field appearance="fill" class="title-field">
                    <input [attr.aria-label]="t('title')" matInput data-testid="title-input" formControlName="title" />
                  </mat-form-field>
                  <app-editor
                    #editorContainer
                    [data]="story.description"
                    [disabled]="!hasModifyPermission"
                  ></app-editor>
                  @if (hasModifyPermission) {
                    <div class="flex flex-row gap-2">
                      <button class="tertiary-button" mat-flat-button type="submit">{{ t("save") }}</button>
                      <button class="secondary-button" mat-flat-button type="button" (click)="cancel()">
                        {{ t("cancel") }}
                      </button>
                    </div>
                  }
                </form>
                <mat-divider></mat-divider>
                @let projectDetail = projectKanbanService.projectService.entityDetail();
                @if (projectDetail && story) {
                  <app-story-detail-attachments
                    [projectDetail]="projectDetail"
                    [storyDetail]="story"
                    [hasModifyPermission]="hasModifyPermission"
                  ></app-story-detail-attachments>
                }
              </div>
              <div
                class="col-span-2 flex flex-col gap-4 border-l border-y-0 border-r-0 border-solid border-outline pl-8 pt-4"
              >
                <div class="grid grid-cols-1 gap-y-4 content-start mb-2">
                  <div class="flex flex-row gap-4">
                    <span class="text-on-surface-variant mat-label-medium self-center">{{ t("created_by") }}</span>
                    <app-user-card
                      [fullName]="story.createdBy?.fullName ? story.createdBy?.fullName : t('former_user')"
                      [username]="story.createdAt | date: 'short'"
                      [color]="story.createdBy?.color || 0"
                    ></app-user-card>
                  </div>
                  <app-story-status
                    [storyDetail]="story"
                    [hasModifyPermission]="hasModifyPermission"
                  ></app-story-status>
                  <app-story-assignee [storyDetail]="story"></app-story-assignee>
                </div>
                <mat-divider></mat-divider>
                <ng-container
                  *appHasPermission="{
                    actualEntity: project,
                    requiredPermission: ProjectPermissions.DELETE_STORY,
                  }"
                >
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
                </ng-container>
              </div>
            </div>
          }
        </ng-container>
      </ng-container>
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StoryDetailComponent {
  protected readonly ProjectPermissions = ProjectPermissions;
  protected readonly hasEntityRequiredPermission = hasEntityRequiredPermission;

  storyDetailFacade = inject(StoryDetailFacade);
  workflowService = this.storyDetailFacade.workflowService;
  projectRepositoryService = inject(ProjectRepositoryService);
  storyService = this.storyDetailFacade.storyService;
  notificationService = inject(NotificationService);
  projectKanbanService = inject(ProjectKanbanService);
  fb = inject(FormBuilder);
  canBeClosed = input(false);
  closed = output<void>();
  selectedStory = this.storyService.entityDetail;
  editor = viewChild.required<EditorComponent>("editorContainer");
  form = this.fb.nonNullable.group({
    title: [{ value: "", disabled: true }, Validators.required],
  });

  constructor() {
    toObservable(this.selectedStory)
      .pipe(filterNotNull())
      .subscribe(async (value) => {
        this.form.setValue({ title: value?.title || "" });

        const project = this.projectRepositoryService.entityDetail();
        if (project) {
          const hasModifyPermission = hasEntityRequiredPermission({
            requiredPermission: ProjectPermissions.MODIFY_STORY,
            actualEntity: project,
          });
          if (hasModifyPermission) {
            this.form.enable();
          } else {
            this.form.disable();
          }
        }
        if (this.workflowService.entityDetail()?.id !== value.workflowId) {
          await this.workflowService.getBySlugRequest(value.workflow);
        }
      });
  }
  async submit() {
    const description = await this.editor().save();
    const data = { ...this.form.getRawValue(), description: JSON.stringify(description) };
    await this.storyDetailFacade.patchSelectedStory(data);
    this.notificationService.success({ title: "notification.action.changes_saved" });
  }

  async cancel() {
    await this.editor().cancel();
    this.form.setValue({ title: this.selectedStory()?.title || "" });
  }

  async onDelete() {
    await this.storyDetailFacade.deleteSelectedStory();
    this.closed.emit();
  }
}
