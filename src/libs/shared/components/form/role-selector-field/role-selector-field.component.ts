/*
 * Copyright (C) 2025-2026 BIRU
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

import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output } from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatFormField } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { Role } from "@tenzu/repository/membership";
import { ProjectRoleRepositoryService } from "@tenzu/repository/project-roles";
import { WorkspaceRoleRepositoryService } from "@tenzu/repository/workspace-roles";
import { MatTooltip } from "@angular/material/tooltip";
import { FormValueControl } from "@angular/forms/signals";

@Component({
  selector: "app-role-selector-field",
  imports: [TranslocoDirective, MatFormField, MatSelectModule, MatTooltip],
  template: `
    <mat-form-field *transloco="let t" [subscriptSizing]="'dynamic'">
      <mat-select
        [value]="value()"
        [disabled]="disabled()"
        (selectionChange)="value.set($event.value); changed.emit($event.value)"
        (closed)="touched.set(true)"
      >
        @for (role of roles(); track role) {
          @let tooltipKey = tooltips[itemType()][role.slug];
          <mat-option
            [matTooltip]="tooltipKey ? t(tooltipKey) : ''"
            [matTooltipDisabled]="!tooltipKey"
            matTooltipPosition="after"
            [value]="role.id"
            >{{ role.name }}</mat-option
          >
        }
      </mat-select>
    </mat-form-field>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleSelectorFieldComponent implements FormValueControl<Role["id"] | null> {
  readonly value = model<Role["id"] | null>(null);
  readonly invalid = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly touched = model<boolean>(false);
  readonly changed = output<Role["id"]>();
  projectRoleRepositoryService = inject(ProjectRoleRepositoryService);
  workspaceRoleRepositoryService = inject(WorkspaceRoleRepositoryService);

  itemType = input.required<"project" | "workspace">();
  userRole = input<Role>();
  roleRepositoryService = computed(() => {
    switch (this.itemType()) {
      case "project": {
        return this.projectRoleRepositoryService;
      }
      case "workspace": {
        return this.workspaceRoleRepositoryService;
      }
    }
  });

  roles = computed(() => {
    const roleRepositoryService = this.roleRepositoryService();
    let roles: Role[] = roleRepositoryService.entitiesSummary();
    if (!this.disabled() && !this.userRole()?.isOwner) {
      roles = roles.filter((role) => !role.isOwner);
    }
    return roles;
  });
  defaultRole = computed(() => this.roleRepositoryService().defaultRole());

  tooltips: Record<"project" | "workspace", Record<Role["slug"], string>> = {
    workspace: {
      owner: "component.role_selector.workspace.owner",
      admin: "component.role_selector.workspace.admin",
      member: "component.role_selector.workspace.member",
      "readonly-member": "component.role_selector.workspace.readonly_member",
    },
    project: {
      owner: "component.role_selector.project.owner",
      admin: "component.role_selector.project.admin",
      "readonly-member": "component.role_selector.project.readonly_member",
    },
  };
  constructor() {
    effect(() => {
      const defautRole = this.defaultRole();
      if (!this.value() && defautRole) {
        this.value.set(defautRole.id);
      }
    });
  }
}
