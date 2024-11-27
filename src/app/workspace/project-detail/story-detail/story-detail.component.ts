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

import { ChangeDetectionStrategy, Component, computed, inject, model, viewChild } from "@angular/core";
import { StoryStore } from "@tenzu/data/story";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButton, MatIconAnchor, MatIconButton } from "@angular/material/button";
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
import { NotificationService, RelativeDialogService } from "@tenzu/utils/services";
import { AvatarListComponent } from "@tenzu/shared/components/avatar/avatar-list/avatar-list.component";
import { ConfirmDirective } from "@tenzu/directives/confirm";
import { StoryDetailService } from "./story-detail.service";
import { AssignDialogComponent } from "@tenzu/shared/components/assign-dialog/assign-dialog.component";
import { matDialogConfig } from "@tenzu/utils";
import { MembershipStore } from "@tenzu/data/membership";
import { WorkflowStore } from "@tenzu/data/workflow";
import { MatOption, MatSelect } from "@angular/material/select";
import { Status } from "@tenzu/data/status";
import { ProjectKanbanService } from "../project-kanban/project-kanban.service";
import { MatDivider } from "@angular/material/divider";
import { BreadcrumbStore } from "@tenzu/data/breadcrumb";
import { ChooseWorkflowDialogComponent } from "./choose-workflow-dialog/choose-workflow-dialog.component";

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
    MatIconAnchor,
    AvatarListComponent,
    MatDivider,
    MatSelect,
    MatOption,
  ],
  template: `<ng-container *transloco="let t; prefix: 'workflow.detail_story'">
    @if (this.selectedStory(); as story) {
      <div class="flex gap-1 items-baseline mb-2">
        <span class="text-neutral-40 mat-title-small">{{ t("workflow") }}</span>
        <span class="text-neutral-20 mat-title-medium">{{ story.workflow.name }}</span>
        <button
          class="icon-sm"
          mat-icon-button
          type="button"
          [attr.aria-label]="t('change_workflow')"
          (click)="openChooseWorkflowDialog($event)"
        >
          <mat-icon>edit</mat-icon>
        </button>
        <span class="text-neutral-40 mat-title-small">/</span>
        <span class="text-neutral-40 mat-title-small">{{ t("story") }}</span>
        <span class="text-neutral-20 mat-title-medium">#{{ story.ref }}</span>
      </div>
      <div class="flex flex-row gap-8">
        <div class="basis-2/3 flex flex-col gap-y-6">
          <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-y-4">
            <mat-form-field appearance="fill" class="title-field">
              <input [attr.aria-label]="t('title')" matInput data-testid="title-input" formControlName="title" />
            </mat-form-field>
            <app-editor #editorContainer [data]="storyStore.selectedStoryDetails().description"></app-editor>
            <div class="flex flex-row gap-2">
              <button class="tertiary-button" mat-flat-button type="submit">{{ t("save") }}</button>
              <button class="secondary-button" mat-flat-button type="button" (click)="cancel()">
                {{ t("cancel") }}
              </button>
            </div>
          </form>
          <mat-divider></mat-divider>
          <div class="flex flex-col gap-y-4">
            <button class="primary-button w-fit" mat-flat-button type="button" (click)="fileUpload.click()">
              <mat-icon class="icon-full">attach_file</mat-icon>
              {{ t("attachments.attach_file") }}
            </button>
            <input type="file" [hidden]="true" (change)="onFileSelected($event)" #fileUpload />
            @let selectedStoryAttachments = storyStore.selectedStoryAttachments();
            @if (selectedStoryAttachments.length > 0) {
              <mat-expansion-panel expanded>
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>attachment</mat-icon>
                    Attachments ({{ selectedStoryAttachments.length }})
                  </mat-panel-title>
                </mat-expansion-panel-header>
                <mat-table [dataSource]="selectedStoryAttachments">
                  <ng-container matColumnDef="name">
                    <mat-header-cell *matHeaderCellDef>{{ t("attachments.name") }}</mat-header-cell>
                    <mat-cell *matCellDef="let row"> {{ row.name }}</mat-cell>
                  </ng-container>

                  <ng-container matColumnDef="size">
                    <mat-header-cell *matHeaderCellDef>{{ t("attachments.size") }}</mat-header-cell>
                    <mat-cell *matCellDef="let row"> {{ row.size }}</mat-cell>
                  </ng-container>

                  <ng-container matColumnDef="date">
                    <mat-header-cell *matHeaderCellDef>{{ t("attachments.date") }}</mat-header-cell>
                    <mat-cell *matCellDef="let row"> {{ row.createdAt | date: "medium" }}</mat-cell>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <mat-header-cell *matHeaderCellDef></mat-header-cell>
                    <mat-cell *matCellDef="let row">
                      <a
                        mat-icon-button
                        target="_blank"
                        href="{{ this.storyDetailService.getStoryAttachmentUrlBack(row.id) }}"
                        type="button"
                      >
                        <mat-icon>visibility</mat-icon>
                      </a>
                      <a
                        mat-icon-button
                        download
                        href="{{ this.storyDetailService.getStoryAttachmentUrlBack(row.id) }}"
                        type="button"
                      >
                        <mat-icon>download</mat-icon>
                      </a>
                      <button mat-icon-button type="button" (click)="deleteAttachment(row.id, row.name)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </mat-cell>
                  </ng-container>

                  <!-- Header and Row Declarations -->
                  <mat-header-row *matHeaderRowDef="['name', 'size', 'date', 'actions']"></mat-header-row>
                  <mat-row *matRowDef="let row; columns: ['name', 'size', 'date', 'actions']"></mat-row>
                </mat-table>
              </mat-expansion-panel>
            }
          </div>
        </div>
        <div
          class="col-span-2 flex flex-col gap-4 border-l border-y-0 border-r-0 border-solid border-neutral-80 pl-8 pt-4"
        >
          <div class="grid grid-cols-2 gap-y-4 content-start mb-2">
            <span class="text-neutral-40 mat-label-medium self-center">{{ t("created_by") }}</span>
            <app-user-card
              [fullName]="story.createdBy?.fullName ? story.createdBy?.fullName : t('former_user')"
              [username]="story.createdAt | date: 'short'"
              [color]="story.createdBy?.color || 0"
            ></app-user-card>
            <span class="text-neutral-40 mat-label-medium self-center">{{ t("status") }}</span>
            <mat-form-field>
              <mat-select
                [(value)]="this.statusSelected"
                (selectionChange)="changeStatus()"
                [compareWith]="compareStatus"
              >
                @for (status of this.workflowStore.selectedEntity()?.statuses; track status.id) {
                  <mat-option [value]="status">{{ status.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <span class="text-neutral-40 mat-label-medium self-center">{{ t("assigned_to") }}</span>
            @if (assigned().length > 0) {
              <button type="button" (click)="openAssignStoryDialog($event)" [attr.aria-label]="t('edit_assignees')">
                <app-avatar-list [users]="assigned()" [prioritizeCurrentUser]="true"></app-avatar-list>
              </button>
            } @else {
              <button
                mat-icon-button
                type="button"
                (click)="openAssignStoryDialog($event)"
                [attr.aria-label]="t('add_assignees')"
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
          >
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      </div>
    }
  </ng-container> `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryDetailComponent {
  storyStore = inject(StoryStore);
  membershipStore = inject(MembershipStore);
  breadcrumbStore = inject(BreadcrumbStore);
  workflowStore = inject(WorkflowStore);
  notificationService = inject(NotificationService);
  storyDetailService = inject(StoryDetailService);
  projectKanbanService = inject(ProjectKanbanService);
  relativeDialog = inject(RelativeDialogService);
  fb = inject(FormBuilder);

  selectedStory = this.storyStore.selectedStoryDetails;
  editor = viewChild.required<EditorComponent>("editorContainer");
  form = this.fb.nonNullable.group({
    title: ["", Validators.required],
  });
  statusSelected = model({} as Status);

  constructor() {
    toObservable(this.selectedStory).subscribe(async (value) => {
      this.form.setValue({ title: value?.title || "" });
      this.statusSelected.set(value.status);
      if (this.workflowStore.selectedEntity()?.id !== value.workflowId) {
        await this.workflowStore.refreshWorkflow(value.workflow);
        this.workflowStore.selectWorkflow(value.workflowId);
      }
    });
    this.breadcrumbStore.setFifthLevel({ label: "workflow.detail_story.story", link: "", doTranslation: true });
    this.breadcrumbStore.setSixthLevel(undefined);
  }

  assigned = computed(() => this.selectedStory().assignees || []);

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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // if exceed 100 MB
      if (input.files[0].size > 104857600) {
        this.notificationService.error({
          translocoTitle: true,
          title: "workflow.detail_story.attachments.exceed_size",
          translocoTitleParams: { var: input.files[0].name },
        });
        return;
      }
      this.storyDetailService.addAttachment(input.files[0]).then();
    }
  }

  deleteAttachment(id: string, filename: string) {
    this.storyDetailService.deleteAttachment(id).then(() => {
      this.notificationService.success({
        translocoTitle: true,
        title: "workflow.detail_story.attachments.deleted_attachment",
        translocoTitleParams: { var: filename },
      });
    });
  }

  async onDelete() {
    await this.storyDetailService.deleteSelectedStory();
  }

  openAssignStoryDialog(event: MouseEvent): void {
    const story = this.storyStore.selectedStoryDetails();
    const teamMembers = this.membershipStore.projectEntities();
    const dialogRef = this.relativeDialog.open(AssignDialogComponent, event?.target, {
      ...matDialogConfig,
      relativeXPosition: "left",
      data: {
        assigned: story.assignees,
        teamMembers: teamMembers,
      },
    });
    dialogRef.componentInstance.memberAssigned.subscribe((username) => this.projectKanbanService.assignStory(username));
    dialogRef.componentInstance.memberUnassigned.subscribe((username) =>
      this.projectKanbanService.removeAssignStory(username),
    );
  }

  openChooseWorkflowDialog(event: MouseEvent): void {
    const story = this.storyStore.selectedStoryDetails();
    const dialogRef = this.relativeDialog.open(ChooseWorkflowDialogComponent, event?.target, {
      ...matDialogConfig,
      relativeXPosition: "right",
      data: {
        currentWorkflowSlug: story.workflow.slug,
      },
    });
    dialogRef.afterClosed().subscribe(async (newWorkflowSlug: string) => {
      if (newWorkflowSlug !== story.workflow.slug) {
        const patchedStory = await this.storyDetailService.patchSelectedStory({ workflow: newWorkflowSlug });
        this.notificationService.success({ title: "notification.action.changes_saved" });
        this.statusSelected.set(patchedStory.status);
      }
    });
  }

  async changeStatus() {
    await this.storyDetailService.patchSelectedStory({ status: this.statusSelected().id });
    this.notificationService.success({ title: "notification.action.changes_saved" });
  }

  compareStatus(o1: Status, o2: Status) {
    if (o1?.id && o2?.id) {
      return o1.id === o2.id;
    }
    return false;
  }
}
