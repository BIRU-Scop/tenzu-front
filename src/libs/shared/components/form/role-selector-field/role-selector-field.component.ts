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

import { ChangeDetectionStrategy, Component, inject, input, OnInit } from "@angular/core";
import { injectNgControl } from "@tenzu/utils/injectors";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatFormField } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { ReactiveFormsModule } from "@angular/forms";
import { Role } from "@tenzu/repository/membership";
import { ProjectRolesRepositoryService } from "@tenzu/repository/project-roles";
import { WorkspaceRolesRepositoryService } from "@tenzu/repository/workspace-roles";
import { NoopValueAccessorDirective } from "@tenzu/directives/noop-value-accessor.directive";

@Component({
  selector: "app-role-selector-field",
  hostDirectives: [NoopValueAccessorDirective],
  imports: [ReactiveFormsModule, TranslocoDirective, MatFormField, MatSelectModule],
  template: `
    <mat-form-field *transloco="let t">
      <mat-select [formControl]="ngControl.control">
        @for (role of roles; track role) {
          <mat-option [value]="role.id">{{ role.name }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleSelectorFieldComponent implements OnInit {
  ngControl = injectNgControl();
  projectRoleRepositoryService = inject(ProjectRolesRepositoryService);
  workspaceRoleRepositoryService = inject(WorkspaceRolesRepositoryService);

  itemType = input.required<"project" | "workspace">();
  roles: Role[] = [];

  getDefaultRole() {
    return this.roles.find((role) => role.slug === "readonly-member");
  }

  ngOnInit() {
    switch (this.itemType()) {
      case "project": {
        this.roles = this.projectRoleRepositoryService.entitiesSummary();
        break;
      }
      case "workspace": {
        this.roles = this.workspaceRoleRepositoryService.entitiesSummary();
        break;
      }
    }
    const defaultRole = this.getDefaultRole();
    if (defaultRole) {
      this.ngControl.control.setValue(defaultRole.id);
    }
  }
}
