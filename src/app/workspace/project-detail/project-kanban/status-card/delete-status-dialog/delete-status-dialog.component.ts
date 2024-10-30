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
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatOption } from "@angular/material/core";
import { MatSelect, MatSelectTrigger } from "@angular/material/select";
import { WorkflowStore } from "@tenzu/data/workflow";
import { toObservable } from "@angular/core/rxjs-interop";
import { filter, take } from "rxjs";

type DeleteStatusDialogData = {
  statusName: string;
  statusId: string;
};

@Component({
  selector: "app-delete-status-dialog",
  standalone: true,
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
    AvatarComponent,
    MatError,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect,
    MatSelectTrigger,
  ],
  template: `
    <ng-container *transloco="let t; prefix: 'workflow.delete_status'">
      <h2 id="aria-label" mat-dialog-title>{{ t("title", { statusName: data.statusName }) }}</h2>
      <mat-dialog-content>
        <h3 class="mat-title-small mb-2">
          {{ isLastStatus() ? t("stories_will_be_deleted") : t("what_to_do_stories") }}
        </h3>
        @if (!isLastStatus()) {
          <form class="flex flex-col gap-y-4" [formGroup]="form">
            <mat-radio-group
              [attr.aria-label]="t('what_to_do_stories')"
              class="flex flex-col gap-1"
              formControlName="stories"
            >
              <mat-radio-button value="move">{{ t("move_stories_another_status") }}</mat-radio-button>
              <div class="pl-9 flex flex-col gap-1">
                <mat-form-field>
                  <mat-label>{{ t("status") }}</mat-label>
                  <mat-select formControlName="status">
                    @for (status of filteredStatus(); track status.id) {
                      <mat-option value="{{ status.id }}">
                        {{ status.name }}
                      </mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <p class="mat-body-small text-neutral-30">{{ t("stories_placed_below") }}</p>
              </div>
              <mat-radio-button value="delete">{{ t("delete_stories") }}</mat-radio-button>
            </mat-radio-group>
          </form>
        }
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-flat-button (click)="submit()" class="error-button">{{ t("confirm") }}</button>
        <button mat-flat-button mat-dialog-close class="secondary-button">{{ t("cancel") }}</button>
      </mat-dialog-actions>
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteStatusDialogComponent {
  data = inject<DeleteStatusDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<DeleteStatusDialogComponent>);
  fb = inject(FormBuilder);
  workflowStore = inject(WorkflowStore);

  form = this.fb.nonNullable.group({
    stories: ["move"],
    status: [""],
  });

  filteredStatus = computed(() => {
    const currWorkflow = this.workflowStore.selectedEntity();
    if (currWorkflow) {
      return currWorkflow.statuses.filter((it) => it.id !== this.data.statusId);
    }
    return [];
  });
  isLastStatus = computed(() => {
    return this.filteredStatus().length === 0;
  });
  constructor() {
    toObservable(this.filteredStatus)
      .pipe(
        filter((filteredStatuses) => filteredStatuses.length > 0),
        take(1),
      )
      .subscribe((filteredStatuses) => {
        this.form.controls.status.setValue(filteredStatuses[0].id);
      });
  }

  submit() {
    if (this.isLastStatus()) {
      this.dialogRef.close({ stories: "delete" });
    } else {
      this.dialogRef.close(this.form.value);
    }
  }
}
