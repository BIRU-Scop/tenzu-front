/*
 * Copyright (C) 2025 BIRU
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
import { MatInput, MatLabel } from "@angular/material/input";
import { WorkspaceRepositoryService } from "@tenzu/repository/workspace";
import { Router } from "@angular/router";
import { NotificationService } from "@tenzu/utils/services/notification";
import { MatError, MatFormField } from "@angular/material/form-field";
import { TranslocoDirective } from "@jsverse/transloco";
import { HasPermissionDirective } from "@tenzu/directives/permission.directive";
import { WorkspacePermissions } from "@tenzu/repository/permission/permission.model";
import { ButtonSaveComponent } from "@tenzu/shared/components/ui/button/button-save.component";
import { ButtonUndoComponent } from "@tenzu/shared/components/ui/button/button-undo.component";
import {
  FormFooterComponent,
  FormFooterSecondaryActionDirective,
} from "@tenzu/shared/components/ui/form-footer/form-footer.component";
import { DeleteWarningButtonComponent } from "@tenzu/shared/components/delete-warning-button/delete-warning-button.component";

@Component({
  selector: "app-workspace-edit",
  imports: [
    AvatarComponent,
    FormsModule,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    TranslocoDirective,
    ReactiveFormsModule,
    HasPermissionDirective,
    ButtonSaveComponent,
    ButtonUndoComponent,
    FormFooterComponent,
    FormFooterSecondaryActionDirective,
    DeleteWarningButtonComponent,
  ],
  template: `
    @let workspace = workspaceService.entityDetail();
    @if (workspace) {
      <div class="flex flex-col gap-y-8 w-min" *transloco="let t">
        <ng-container
          *appHasPermission="
            {
              actualEntity: workspace,
              requiredPermission: WorkspacePermissions.MODIFY_WORKSPACE,
            };
            else noModifyPermission
          "
        >
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-y-2">
            <div class="flex flex-row gap-4 items-center" *transloco="let t">
              <app-avatar size="xl" [name]="form.controls.name.value" [color]="workspace.color || 0"></app-avatar>
              <mat-form-field class="w-96">
                <mat-label>{{ t("workspace.settings.edit.name") }}</mat-label>
                <input formControlName="name" matInput required placeholder="name" class="" />
                @if (form.controls.name.hasError("required")) {
                  <mat-error
                    data-testid="workspace-name-required-error"
                    [innerHTML]="t('workspace.settings.edit.name_required')"
                  ></mat-error>
                }
                @if (form.controls.name.hasError("maxlength")) {
                  <mat-error [innerHTML]="t('workspace.settings.edit.name_max_length')"></mat-error>
                }
              </mat-form-field>
            </div>
            <app-form-footer>
              <app-button-undo
                appFormFooterSecondaryAction
                (click)="reset()"
                [disabled]="form.pristine"
              ></app-button-undo>
              <app-button-save [disabled]="form.pristine || form.invalid" />
            </app-form-footer>
          </form>

          <app-delete-warning-button
            *appHasPermission="{
              actualEntity: workspace,
              requiredPermission: WorkspacePermissions.DELETE_WORKSPACE,
            }"
            [translocoKeyTitle]="'workspace.settings.edit.delete_workspace'"
            [translocoKeyWarningMessage]="
              workspace.totalProjects || 0 > 0 ? 'workspace.settings.edit.delete.error' : undefined
            "
            [translocoKeyWarningMessageParams]="{ totalProjects: workspace.totalProjects }"
            (popupConfirm)="onDelete()"
            [disabled]="(workspace.totalProjects || 0) > 0"
          />
        </ng-container>
      </div>
      <ng-template #noModifyPermission>
        <div class="flex flex-row gap-4 items-center" *transloco="let t">
          <app-avatar size="xl" [name]="form.controls.name.value" [color]="workspace.color || 0"></app-avatar>
          {{ workspace.name }}
        </div>
      </ng-template>
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WorkspaceEditComponent {
  protected readonly WorkspacePermissions = WorkspacePermissions;

  workspaceService = inject(WorkspaceRepositoryService);

  fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    name: ["", [Validators.required, Validators.maxLength(40)]],
  });
  router = inject(Router);
  notificationService = inject(NotificationService);

  constructor() {
    effect(() => {
      this.reset();
    });
  }

  async onSubmit() {
    const workspace = this.workspaceService.entityDetail();
    if (workspace) {
      this.form.reset(this.form.value);
      if (this.form.valid) {
        await this.workspaceService.patchRequest(workspace.id, this.form.getRawValue(), { workspaceId: workspace.id });
        this.notificationService.success({
          title: "notification.action.changes_saved",
        });
      }
    }
  }

  async onDelete() {
    const workspace = this.workspaceService.entityDetail();
    if (!workspace) {
      return;
    }
    const deletedWorkspace = await this.workspaceService.deleteRequest(workspace, { workspaceId: workspace.id });
    if (deletedWorkspace) {
      await this.router.navigateByUrl("/");
      this.notificationService.error({
        translocoTitle: true,
        title: "workspace.settings.delete.deleted_workspace",
        translocoTitleParams: { var: deletedWorkspace.name },
      });
    }
  }

  reset() {
    const selectedEntity = this.workspaceService.entityDetail();
    if (selectedEntity) {
      this.form.reset({ ...selectedEntity });
    }
  }
}
