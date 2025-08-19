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

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDivider } from "@angular/material/divider";
import { MatError, MatInput, MatLabel } from "@angular/material/input";
import { MatRadioButton, MatRadioGroup } from "@angular/material/radio";
import { AllProjectPermissionsByTheme, GroupPermissionKey } from "@tenzu/repository/permission/permission.model";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatFormField } from "@angular/material/form-field";
import { PermissionsFormGroupControl } from "../role.facade";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "app-form-role",
  imports: [
    ReactiveFormsModule,
    MatDivider,
    MatFormField,
    MatInput,
    MatLabel,
    MatRadioButton,
    MatRadioGroup,
    TranslocoDirective,
    MatError,
    MatIcon,
  ],
  template: `
    @let _form = form();
    <ng-container *transloco="let t; scope: 'project'">
      @if (_form.controls.name.disabled) {
        <h1 class="mat-display-small">{{ _form.controls.name.value }}</h1>
      } @else {
        <mat-form-field>
          <mat-label>name</mat-label>
          <input [formControl]="_form.controls['name']" matInput />
          @if (_form.controls.name.hasError("required")) {
            <mat-error>{{ t("project.settings.permissions.name_required") }}</mat-error>
          }
          @if (_form.controls.name.hasError("forbiddenName")) {
            <mat-error>{{ t("project.settings.permissions.name_forbidden") }}</mat-error>
          }
        </mat-form-field>
      }
      <h2 class="mat-headline-small">{{ t("project.settings.permissions.title") }}</h2>

      <mat-divider></mat-divider>
      <div>{{ t("project.settings.permissions.hint_permission") }}</div>
      @if (_form.hasError("permissionsEmpty")) {
        <mat-error>{{ t("project.settings.permissions.empty_permission") }}</mat-error>
      }
      @for (permissionGroup of permissionsGroups; track permissionGroup) {
        <div class="mat-title-medium mt-4 flex flex-row items-center gap-2">
          {{ t(AllProjectPermissionsByTheme[permissionGroup].labelTransloco) }}
          @if (permissionGroup === "comment") {
            <div class="mt-1 flex flex-row items-center mat-body-small text-on-surface">
              <mat-icon class="icon-sm mr-1">schedule</mat-icon
              >{{ t("project.settings.permissions.comment.coming_soon") }}
            </div>
          }
        </div>
        <mat-radio-group
          [formControl]="_form.controls[permissionGroup]"
          [attr.aria-label]="t('commons.select_option')"
          class="flex flex-col mb-4"
        >
          @if (_form.enabled) {
            @if (permissionGroup === "comment" && !_form.value.story) {
              <div class="mb-1">
                {{ t("project.settings.permissions.comment.no_story_permissions") }}
              </div>
            }
            @if (permissionGroup === "role" && !_form.value.member) {
              <div class="mb-1">
                {{ t("project.settings.permissions.role.no_member_permissions") }}
              </div>
            }
            @if (permissionGroup === "workflow" && !_form.value.story) {
              <div class="mb-1">
                {{ t("project.settings.permissions.workflow.no_story_permissions") }}
              </div>
            }
          }
          @for (permission of AllProjectPermissionsByTheme[permissionGroup].permissions; track permission) {
            <mat-radio-button [value]="permission"
              >{{ t("project.settings.permissions." + permissionGroup + "." + permission) }}
            </mat-radio-button>
          }
          <mat-radio-button [value]="null"> {{ t("project.settings.permissions.no_permission") }}</mat-radio-button>
        </mat-radio-group>
        <mat-divider></mat-divider>
      }
    </ng-container>
  `,
  styles: ``,
  host: {
    class: "flex flex-col gap-y-4",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormRoleComponent {
  form = input.required<PermissionsFormGroupControl>();
  readonly permissionsGroups: GroupPermissionKey[] = ["member", "role", "project", "story", "comment", "workflow"];
  protected readonly AllProjectPermissionsByTheme = AllProjectPermissionsByTheme;
}
