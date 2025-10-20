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

import { ChangeDetectionStrategy, Component, HostListener, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from "@angular/material/dialog";
import { TranslocoDirective } from "@jsverse/transloco";
import { ProjectRepositoryService } from "@tenzu/repository/project";
import { MatRadioButton, MatRadioGroup } from "@angular/material/radio";
import { StorySummary } from "@tenzu/repository/story";

export type ChooseWorkflowDialogData = {
  currentWorkflowId: StorySummary["workflowId"];
};

@Component({
  selector: "app-enter-name-dialog",
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    ReactiveFormsModule,
    TranslocoDirective,
    MatRadioGroup,
    MatRadioButton,
  ],
  template: `
    <ng-container *transloco="let t">
      <mat-dialog-content>
        <div class="flex flex-col gap-4">
          <label for="workflow" id="aria-label">{{ t("workflow.detail_story.change_workflow") }}</label>
          <mat-radio-group
            aria-labelledby="aria-label"
            [formControl]="newWorkflowId"
            class="flex flex-col"
            name="workflow"
          >
            @let workflows = projectService.entityDetail()?.workflows || [];
            @for (workflow of workflows; track workflow.id) {
              <mat-radio-button [value]="workflow.id">{{ workflow.name }}</mat-radio-button>
            }
          </mat-radio-group>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button data-testid="choose-workflow-submit" mat-flat-button class="tertiary-button" (click)="submit()">
          {{ t("commons.save") }}
        </button>
        <button data-testid="close-dialog" mat-flat-button class="secondary-button" mat-dialog-close>
          {{ t("commons.cancel") }}
        </button>
      </mat-dialog-actions>
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChooseWorkflowDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ChooseWorkflowDialogComponent>);
  data = inject<ChooseWorkflowDialogData>(MAT_DIALOG_DATA);
  fb = inject(FormBuilder);
  newWorkflowId = this.fb.nonNullable.control(this.data.currentWorkflowId || "");
  projectService = inject(ProjectRepositoryService);

  @HostListener("window:keyup.Enter")
  onPressEnter() {
    this.submit();
  }

  submit() {
    this.dialogRef.close(this.newWorkflowId.value);
  }
}
