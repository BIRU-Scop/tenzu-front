/*
 * Copyright (C) 2026 BIRU
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

import { Component, computed, inject, input, linkedSignal, output } from "@angular/core";
import { A11yModule } from "@angular/cdk/a11y";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  form,
  FormField,
  FormRoot,
  StandardSchemaValidationError,
  validate,
  validateStandardSchema,
  ValidationError,
} from "@angular/forms/signals";
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { ButtonCancelComponent } from "@tenzu/shared/components/ui/button/button-cancel.component";
import { ButtonSaveComponent } from "@tenzu/shared/components/ui/button/button-save.component";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { TranslocoDirective } from "@jsverse/transloco";
import { ColorPickerComponent } from "@tenzu/shared/components/form/color-picker/color-picker.component";
import { StoryTagRepositoryService } from "@tenzu/repository/story-tag/story-tag-repository.service";
import {
  CreateStoryTagPayload,
  createStoryTagPayloadSchema,
  StoryTagWithCount,
} from "@tenzu/repository/story-tag/story-tag.model";

@Component({
  selector: "app-story-tag-dialog",
  imports: [
    A11yModule,
    ButtonCancelComponent,
    ButtonSaveComponent,
    ColorPickerComponent,
    FormField,
    FormRoot,
    FormsModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    TranslocoDirective,
  ],
  template: `
    <ng-container *transloco="let t">
      <h2 matDialogTitle>
        {{
          t(
            isEdition()
              ? "project.settings.attributes.tags.dialog.title_edit"
              : "project.settings.attributes.tags.dialog.title_create"
          )
        }}
      </h2>
      <mat-dialog-content>
        <form [formRoot]="tagForm" class="flex flex-col gap-4">
          <mat-form-field>
            <mat-label>{{ t("project.settings.attributes.tags.dialog.name_label") }}</mat-label>
            <input matInput [formField]="tagForm.label" cdkFocusInitial />
            @if (tagForm.label().touched() && tagForm.label().invalid()) {
              <mat-error>
                @for (error of tagForm.label().errors(); track error.kind) {
                  {{ t(labelErrorKey(error)) }}
                }
              </mat-error>
            }
          </mat-form-field>
          <p class="mat-body-medium">{{ t("project.settings.attributes.tags.dialog.choose_color") }}</p>
          <app-color-picker [(value)]="formModel().color" />
        </form>
      </mat-dialog-content>
      <mat-dialog-actions [align]="'end'" class="gap-2">
        <app-button-cancel matDialogClose />
        <app-button-save
          [translocoKey]="
            isEdition()
              ? 'project.settings.attributes.tags.dialog.save'
              : 'project.settings.attributes.tags.dialog.create'
          "
          [iconName]="isEdition() ? 'save' : 'add'"
          [disabled]="tagForm().invalid()"
          (click)="submit()"
        />
      </mat-dialog-actions>
    </ng-container>
  `,
})
export class StoryTagDialogComponent {
  protected dialogRef = inject<MatDialogRef<StoryTagDialogComponent>>(MatDialogRef);

  tag = input<StoryTagWithCount>();
  saved = output<CreateStoryTagPayload>();

  private storyTagRepositoryService = inject(StoryTagRepositoryService);

  protected isEdition = computed(() => this.tag() !== undefined);
  protected formModel = linkedSignal<CreateStoryTagPayload>(() => ({
    label: this.tag()?.label ?? "",
    color: this.tag()?.color ?? 1,
  }));
  protected tagForm = form(this.formModel, (schemaPath) => {
    validateStandardSchema(schemaPath, createStoryTagPayloadSchema);
    validate(schemaPath.label, (context) => {
      const label = context.value().trim().normalize("NFC").toLowerCase();
      const taken = this.storyTagRepositoryService
        .entitiesSummary()
        .some((tag) => tag.label.normalize("NFC").toLowerCase() === label && tag.id !== this.tag()?.id);
      return taken ? { kind: "unique_label", message: "project.settings.attributes.tags.dialog.errors.unique" } : null;
    });
  });

  protected labelErrorKey(error: ValidationError): string {
    if (error instanceof StandardSchemaValidationError) {
      const code = (error.issue as { code?: string }).code;
      if (code === "too_small") {
        return "project.settings.attributes.tags.dialog.errors.required";
      }
      if (code === "too_big") {
        return "project.settings.attributes.tags.dialog.errors.max_length";
      }
      if (code === "custom") {
        return "project.settings.attributes.tags.dialog.errors.invalid_characters";
      }
    }
    return error.message ?? "";
  }

  protected submit() {
    this.saved.emit(createStoryTagPayloadSchema.parse(this.formModel()));
    this.dialogRef.close();
  }
}
