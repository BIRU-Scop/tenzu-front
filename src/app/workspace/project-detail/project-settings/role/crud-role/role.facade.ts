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

import { computed, inject, Injectable, Signal } from "@angular/core";
import {
  AllProjectPermissionsByTheme,
  GroupPermissionKey,
  ProjectPermissions,
} from "@tenzu/repository/permission/permission.model";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ProjectDetail, ProjectRepositoryService } from "@tenzu/repository/project";
import { ProjectRoleRepositoryService, ProjectRoleSummary } from "@tenzu/repository/project-roles";
import { TypedDialogService } from "@tenzu/utils/services/typed-dialog-service/typed-dialog.service";
import { DeleteRoleDialogComponent } from "./edit-role/delete-role-dialog/delete-role-dialog.component";
import { ActivatedRoute, Router } from "@angular/router";
import { ProjectMembershipRepositoryService } from "@tenzu/repository/project-membership";

export type PermissionValuesFor<K extends GroupPermissionKey> =
  | (typeof AllProjectPermissionsByTheme)[K]["permissions"][number]
  | null; // For "none"/empty case

export type PermissionsFormValue = {
  [K in GroupPermissionKey]: PermissionValuesFor<K>;
};

type ControlsOf<T> = {
  [K in keyof T]: FormControl<
    // Remove FormControl<> if already used in T[K]
    T[K] extends FormControl<infer R> ? R : T[K]
  >;
};
export type FormValue = PermissionsFormValue & { name: ProjectRoleSummary["name"] };
// Define the Angular form type
export type PermissionsFormGroupControl = FormGroup<ControlsOf<FormValue>>;

export const EMPTY_ROLE_FORM_VALUE: FormValue = {
  name: "",
  role: null,
  project: null,
  story: null,
  member: null,
  workflow: null,
  comment: null,
};

@Injectable({
  providedIn: "root",
})
export class RoleFacade {
  readonly fb = inject(FormBuilder);
  readonly projectRoleRepositoryService = inject(ProjectRoleRepositoryService);
  readonly projectMembershipRepositoryService = inject(ProjectMembershipRepositoryService);
  readonly projectRepositoryService = inject(ProjectRepositoryService);
  readonly typedDialogService = inject(TypedDialogService);
  readonly currentRole = this.projectRoleRepositoryService.entityDetail;
  readonly currentProjectDetail = this.projectRepositoryService.entityDetail;
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);

  readonly rolesName = computed(() => {
    const roles = this.projectRoleRepositoryService.entitiesSummary();
    return roles.map((role) => role.name.toLowerCase());
  });

  permissionsEmptyValidator(control: PermissionsFormGroupControl) {
    const values = Object.values(control.value).filter((value) => value);
    return values.length <= 1 ? { permissionsEmpty: true } : null;
  }

  forbiddenNameValidator(
    existingRolesName: Signal<ProjectRoleSummary["name"][]>,
    currentRole?: Signal<ProjectRoleSummary | undefined>,
  ) {
    return (control: FormControl<ProjectRoleSummary["name"]>) => {
      if (currentRole) {
        if (control.value === currentRole()?.name) {
          return null;
        }
      }
      const value = control.value.toLowerCase().trim();
      return existingRolesName().includes(value) ? { forbiddenName: true } : null;
    };
  }
  buildForm(option: { createMode: boolean } = { createMode: false }): FormGroup {
    const form = this.fb.group(
      {
        name: [
          "" as ProjectRoleSummary["name"],
          [
            Validators.required,
            this.forbiddenNameValidator(this.rolesName, option.createMode ? undefined : this.currentRole),
          ],
        ],
        role: [null as PermissionValuesFor<"role">],
        project: [null as PermissionValuesFor<"project">],
        story: [null as PermissionValuesFor<"story">],
        member: [null as PermissionValuesFor<"member">],
        workflow: [null as PermissionValuesFor<"workflow">],
        comment: [null as PermissionValuesFor<"comment">],
      },
      { validators: this.permissionsEmptyValidator },
    ) as PermissionsFormGroupControl;
    const commentControl = form.controls.comment;
    const storyControl = form.controls.story;
    const roleControl = form.controls.role;
    const memberControl = form.controls.member;
    const workflowControl = form.controls.workflow;
    commentControl.disable();
    workflowControl.disable();
    roleControl.disable();
    storyControl.valueChanges.subscribe((value) => {
      if (form.disabled) {
        return;
      }
      if (!value) {
        commentControl.disable();
        workflowControl.disable();
        if (commentControl.value) {
          commentControl.setValue(null);
        }
        if (workflowControl.value) {
          workflowControl.setValue(null);
        }
      } else {
        if (commentControl.disabled) {
          commentControl.enable();
        }
        if (workflowControl.disabled) {
          workflowControl.enable();
        }
      }
    });
    memberControl.valueChanges.subscribe((value) => {
      if (form.disabled) {
        return;
      }
      if (!value) {
        roleControl.disable();
        if (roleControl.value) {
          roleControl.setValue(null);
        }
      } else if (value && roleControl.disabled) {
        roleControl.enable();
      }
    });
    return form;
  }
  initForm(data: { role: ProjectRoleSummary; form: PermissionsFormGroupControl }) {
    const values = this.mapPermissionsToFormValue(data.role.permissions as ProjectPermissions[]);
    data.form.setValue({ ...values, name: data.role.name }, { emitEvent: true });
    if (!data.role.editable) {
      data.form.disable();
    } else {
      data.form.enable();
    }
  }
  mapPermissionsToFormValue(permissions: ProjectPermissions[]): PermissionsFormValue {
    const formValue = { ...EMPTY_ROLE_FORM_VALUE };
    for (const permission of permissions) {
      switch (permission) {
        case ProjectPermissions.CREATE_MODIFY_DELETE_ROLE:
          formValue["role"] = ProjectPermissions.CREATE_MODIFY_DELETE_ROLE;
          break;
        case ProjectPermissions.MODIFY_PROJECT:
        case ProjectPermissions.DELETE_PROJECT:
          formValue["project"] = permission;
          break;
        case ProjectPermissions.CREATE_MODIFY_MEMBER:
        case ProjectPermissions.DELETE_MEMBER:
          formValue["member"] = permission;
          break;
        case ProjectPermissions.VIEW_STORY:
        case ProjectPermissions.MODIFY_STORY:
        case ProjectPermissions.CREATE_STORY:
        case ProjectPermissions.DELETE_STORY:
          formValue["story"] = permission;
          break;
        case ProjectPermissions.VIEW_WORKFLOW:
        case ProjectPermissions.MODIFY_WORKFLOW:
        case ProjectPermissions.CREATE_WORKFLOW:
        case ProjectPermissions.DELETE_WORKFLOW:
          formValue["workflow"] = permission;
          break;
        case ProjectPermissions.VIEW_COMMENT:
        case ProjectPermissions.CREATE_MODIFY_DELETE_COMMENT:
        case ProjectPermissions.MODERATE_COMMENT:
          formValue["comment"] = permission;
          break;
      }
    }
    return formValue;
  }

  private getPermissionsSelection(
    filteredValues: Partial<PermissionsFormValue>,
  ): Partial<Record<GroupPermissionKey, ProjectPermissions[]>> {
    const result: Partial<Record<GroupPermissionKey, ProjectPermissions[]>> = {};

    for (const [key, value] of Object.entries(filteredValues)) {
      const permissionKey = key as GroupPermissionKey;
      const permissionsArray = AllProjectPermissionsByTheme[permissionKey].permissions;
      // If no selection or value not found, skip
      if (value == null) continue;
      const idx = permissionsArray.indexOf(value as ProjectPermissions);
      // Take all permissions up to and including index if found
      if (idx !== -1) {
        result[permissionKey] = permissionsArray.slice(0, idx + 1);
      }
    }

    return result;
  }

  clearValues(values: FormValue) {
    const filteredValues = Object.entries(values)
      .filter((item) => item[1] !== null)
      .reduce((acc, [key, val]) => {
        acc[key as GroupPermissionKey] = val as PermissionValuesFor<GroupPermissionKey>;
        return acc;
      }, {} as Partial<FormValue>);
    const { name, ...rest } = filteredValues;
    // For each key and value, get the list of permissions "up to and including"
    const permissionsSelection = this.getPermissionsSelection(rest);
    return { name, permissions: Object.values(permissionsSelection).flat() } as Pick<
      ProjectRoleSummary,
      "name" | "permissions"
    >;
  }

  async update({ currentRole, values }: { currentRole: ProjectRoleSummary; values: FormValue }) {
    const clearedValues = this.clearValues(values);
    const role = clearedValues.name ? { ...currentRole, name: clearedValues.name } : { ...currentRole };
    if (currentRole) {
      await this.projectRoleRepositoryService.patchRequest(
        currentRole.id,
        { ...role, permissions: clearedValues.permissions },
        { roleId: currentRole.id },
      );
    }
  }
  async create({ values, projectId }: { values: FormValue; projectId: ProjectDetail["id"] }) {
    const clearedValues = this.clearValues(values);
    return this.projectRoleRepositoryService.createRequest(clearedValues, { projectId });
  }

  async deleteRole(currentRole: ProjectRoleSummary, projectDetail: ProjectDetail) {
    // the currentRole has members and / or invitees
    if (currentRole.totalMembers || currentRole.hasInvitees) {
      this.typedDialogService
        .open(DeleteRoleDialogComponent, { data: { projectRoleSummary: currentRole, projectDetail: projectDetail } })
        .afterClosed()
        .subscribe(async (moveToProjectRole) => {
          if (moveToProjectRole) {
            await this.projectRoleRepositoryService.deleteRequest(
              currentRole,
              { roleId: currentRole.id },
              { moveTo: moveToProjectRole.id },
            );
            this.projectMembershipRepositoryService.upsertMultipleEntitiesSummary(
              this.projectMembershipRepositoryService
                .entities()
                .filter((item) => item.roleId === currentRole.id)
                .map((item) => ({ ...item, roleId: moveToProjectRole.id })),
            );
            this.projectRoleRepositoryService.listRequest({ projectId: projectDetail.id }).then();
            this.router
              .navigate([
                "/",
                "workspace",
                projectDetail.workspaceId,
                "project",
                projectDetail.id,
                "settings",
                "list-roles",
              ])
              .then();
          }
        });
    } else {
      await this.projectRoleRepositoryService.deleteRequest(currentRole, { roleId: currentRole.id });
      this.router
        .navigate(["/", "workspace", projectDetail.workspaceId, "project", projectDetail.id, "settings", "list-roles"])
        .then();
    }
  }
}
