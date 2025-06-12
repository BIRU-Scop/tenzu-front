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

import { ChangeDetectionStrategy, Component, computed, effect, inject, input, OnInit, output } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MembershipBase, Role } from "@tenzu/repository/membership";
import { RoleSelectorFieldComponent } from "@tenzu/shared/components/form/role-selector-field/role-selector-field.component";
import { filterNotNull } from "@tenzu/utils/functions/rxjs.operators";
import { WorkspaceMembershipRepositoryService } from "@tenzu/repository/workspace-membership";
import { ProjectMembershipRepositoryService } from "@tenzu/repository/project-membership";
import { PermissionsBase } from "@tenzu/repository/permission/permission.model";
import { hasEntityRequiredPermission } from "@tenzu/repository/permission/permission.service";
import { WorkspaceDetail } from "@tenzu/repository/workspace";
import { ProjectDetail } from "@tenzu/repository/project";

@Component({
  selector: "app-membership-role",
  imports: [FormsModule, RoleSelectorFieldComponent, ReactiveFormsModule],
  template: `
    @if (roleControl.value) {
      <app-role-selector-field [formControl]="roleControl" [itemType]="itemType()" [userRole]="entityRole().userRole" />
    }
  `,
  styles: ``,
  host: {
    class: "w-full",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembershipRoleComponent<T extends WorkspaceDetail | ProjectDetail> implements OnInit {
  workspaceMembershipRepositoryService = inject(WorkspaceMembershipRepositoryService);
  projectMembershipRepositoryService = inject(ProjectMembershipRepositoryService);

  membership = input.required<MembershipBase>();
  itemType = input.required<"project" | "workspace">();
  entityRole = input.required<T>();
  isSelf = input(false);
  membershipRepositoryService = computed(() => {
    switch (this.itemType()) {
      case "project": {
        return this.projectMembershipRepositoryService;
      }
      case "workspace": {
        return this.workspaceMembershipRepositoryService;
      }
    }
  });
  roleControl = new FormControl<Role["id"] | null>(null, { validators: [Validators.required] });
  changedSelf = output<{ roleId: Role["id"]; entityRole: T }>();

  constructor() {
    effect(() => {
      const membership = this.membership();
      const entityRole = this.entityRole();
      this.roleControl.reset(
        {
          value: membership.roleId,
          disabled:
            !hasEntityRequiredPermission({
              actualEntity: entityRole,
              requiredPermission: PermissionsBase.CREATE_MODIFY_MEMBER,
            }) || !!(entityRole.userRole?.isOwner && this.isSelf()),
        },
        { onlySelf: true, emitEvent: false },
      );
    });
  }

  ngOnInit() {
    return this.roleControl.valueChanges.pipe(filterNotNull()).subscribe(async (value: Role["id"]) => {
      await this.membershipRepositoryService().patchRequest(this.membership().id, {
        roleId: value,
      });
      if (this.isSelf()) {
        this.changedSelf.emit({ roleId: value, entityRole: this.entityRole() });
      }
    });
  }
}
