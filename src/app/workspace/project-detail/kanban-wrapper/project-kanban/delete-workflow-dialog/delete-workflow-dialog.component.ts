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

import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { MatButton } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { TranslocoDirective } from "@jsverse/transloco";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { MatRadioButton, MatRadioGroup } from "@angular/material/radio";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatOption } from "@angular/material/core";
import { MatSelect } from "@angular/material/select";
import { toObservable } from "@angular/core/rxjs-interop";
import { filter, take } from "rxjs";
import { WorkflowService } from "@tenzu/data/workflow/workflow.service";
import { ProjectService } from "@tenzu/data/project";

export type DialogData = {
  workflowName: string;
  workflowId: string;
};

export type FormData = { stories: "move" | "delete"; workflowTarget: string };

@Component({
  selector: "app-delete-status-dialog",
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatRadioGroup,
    MatRadioButton,
    TranslocoDirective,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect,
  ],
  template: `
    <ng-container *transloco="let t; prefix: 'workflow.delete_workflow'">
      <h2 id="aria-label" mat-dialog-title>{{ t("title", { workflowName: data.workflowName }) }}</h2>
      <mat-dialog-content>
        <h3 class="mat-title-small mb-2">
          {{ isLastWorkflow() ? t("stories_and_statuses_will_be_deleted") : t("what_to_do") }}
        </h3>
        @if (!isLastWorkflow()) {
          <form class="flex flex-col gap-y-4" [formGroup]="form">
            <mat-radio-group [attr.aria-label]="t('what_to_do')" class="flex flex-col gap-1" formControlName="stories">
              <mat-radio-button value="move">{{ t("move_to_another_workflow") }}</mat-radio-button>
              <div class="pl-9 flex flex-col gap-1">
                <mat-form-field>
                  <mat-label>{{ t("workflow") }}</mat-label>
                  <mat-select formControlName="workflowTarget" [placeholder]="t('select_placeholder')">
                    @for (workflow of filteredWorkflows(); track workflow.slug) {
                      <mat-option value="{{ workflow.slug }}">
                        {{ workflow.name }}
                      </mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <p class="mat-body-small text-on-surface">{{ t("stories_and_statuses_target_location") }}</p>
              </div>
              <mat-radio-button value="delete">{{ t("delete_all") }}</mat-radio-button>
            </mat-radio-group>
          </form>
        }
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-flat-button mat-dialog-close [attr.aria-label]="t('actions.cancel')" class="secondary-button">
          {{ t("actions.cancel") }}
        </button>
        <button mat-flat-button (click)="submit()" [attr.aria-label]="t('actions.confirm')" class="error-button">
          {{ t("actions.confirm") }}
        </button>
      </mat-dialog-actions>
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteWorkflowDialogComponent {
  data = inject<DialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<DeleteWorkflowDialogComponent>);
  fb = inject(FormBuilder);
  workflowService = inject(WorkflowService);
  projectService = inject(ProjectService);

  form = this.fb.nonNullable.group<FormData>({
    stories: "move",
    workflowTarget: "",
  });

  filteredWorkflows = computed(() => {
    const currWorkflow = this.workflowService.selectedEntity();
    const currProject = this.projectService.selectedEntity();
    if (currWorkflow && currProject) {
      return currProject.workflows.filter((it) => it.id !== this.data.workflowId);
    }
    return [];
  });
  isLastWorkflow = computed(() => {
    return this.filteredWorkflows().length === 0;
  });

  constructor() {
    toObservable(this.filteredWorkflows)
      .pipe(
        filter((filteredWorkflows) => filteredWorkflows.length > 0),
        take(1),
      )
      .subscribe((filteredWorkflows) => {
        this.form.controls.workflowTarget.setValue(filteredWorkflows[0].slug);
      });
  }

  submit() {
    if (this.isLastWorkflow()) {
      this.dialogRef.close({ stories: "delete" });
    } else {
      this.dialogRef.close(this.form.value);
    }
  }
}
