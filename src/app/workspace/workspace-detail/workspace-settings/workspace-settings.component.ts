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

import { ChangeDetectionStrategy, Component, effect, inject } from "@angular/core";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatButton } from "@angular/material/button";
import { TranslocoDirective } from "@jsverse/transloco";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslatedSnackbarComponent } from "@tenzu/shared/components/translated-snackbar/translated-snackbar.component";
import { BreadcrumbStore } from "@tenzu/data/breadcrumb/breadcrumb.store";
import { ConfirmDirective } from "@tenzu/directives/confirm";
import { MatIcon } from "@angular/material/icon";
import { WorkspaceService } from "@tenzu/data/workspace/workspace.service";

@Component({
  selector: "app-workspace-settings",
  imports: [
    AvatarComponent,
    FormsModule,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    MatButton,
    TranslocoDirective,
    ReactiveFormsModule,
    ConfirmDirective,
    MatIcon,
  ],
  template: `
    @let workspace = workspaceService.selectedEntity();
    <div class="flex flex-col gap-y-8" *transloco="let t; prefix: 'workspace.settings'">
      <h1 class="mat-headline-medium">{{ t("title") }}</h1>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-y-2">
        <h2 class="mat-headline-small">{{ t("edit_profile") }}</h2>
        <div class="flex flex-row gap-4 items-center" *transloco="let t; prefix: 'workspace.settings.edit'">
          <app-avatar size="xl" [name]="form.controls.name.value" [color]="workspace?.color || 0"></app-avatar>
          <div class="flex flex-col gap-y-4">
            <mat-form-field>
              <mat-label>{{ t("name") }}</mat-label>
              <input formControlName="name" matInput required placeholder="name" data-testid="workspace-name-input" />
              @if (form.controls.name.hasError("required")) {
                <mat-error data-testid="workspace-name-required-error" [innerHTML]="t('name_required')"></mat-error>
              }
            </mat-form-field>
          </div>
        </div>
        <div class="flex gap-x-4 mt-2" *transloco="let t; prefix: 'commons'">
          <button mat-flat-button type="submit" class="tertiary-button" data-testid="workspace-edit-submit">
            {{ t("save") }}
          </button>
          <button mat-flat-button (click)="reset()" class="secondary-button">
            {{ t("cancel") }}
          </button>
        </div>
      </form>
      <div class="flex flex-col gap-y-2">
        <h2 class="mat-headline-small">{{ t("delete_workspace") }}</h2>
        <div *transloco="let t; prefix: 'workspace.settings.delete'" class="flex flex-col gap-4">
          @if (workspace?.hasProjects) {
            <div class="flex flex-row">
              <mat-icon class="text-on-error pr-3 self-center">warning</mat-icon>
              <p
                class="mat-body-medium text-on-error-container align-middle"
                [innerHTML]="t('error', { totalProjects: workspace?.totalProjects })"
              ></p>
            </div>
          }
          <button
            [disabled]="workspace?.hasProjects"
            mat-flat-button
            class="error-button w-fit"
            appConfirm
            [data]="{ deleteAction: true }"
            (popupConfirm)="onDelete()"
          >
            {{ t("delete") }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WorkspaceSettingsComponent {
  workspaceService = inject(WorkspaceService);
  // workspaceStore = this.workspaceService.workspaceStore;

  fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    name: ["", Validators.required],
  });
  router = inject(Router);
  _snackBar = inject(MatSnackBar);
  readonly breadcrumbStore = inject(BreadcrumbStore);

  async onSubmit() {
    this.form.reset(this.form.value);
    if (this.form.valid) {
      await this.workspaceService.updateSelected(this.form.getRawValue());
    }
  }

  async onDelete() {
    const deletedWorkspace = await this.workspaceService.deleteSelected();

    await this.router.navigateByUrl("/");
    this._snackBar.openFromComponent(TranslatedSnackbarComponent, {
      duration: 3000,
      data: {
        message: "workspace.settings.delete.deleted_workspace",
        var: deletedWorkspace?.name,
      },
    });
  }

  reset() {
    const selectedEntity = this.workspaceService.selectedEntity();
    if (selectedEntity) {
      this.form.reset({ ...selectedEntity });
    }
  }

  constructor() {
    this.breadcrumbStore.setThirdLevel({
      label: "workspace.general_title.workspaceSettings",
      link: "",
      doTranslation: true,
    });
    effect(() => {
      this.reset();
    });
  }
}
