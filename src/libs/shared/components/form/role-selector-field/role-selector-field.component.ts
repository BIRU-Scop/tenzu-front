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

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  input,
  OnInit,
  runInInjectionContext,
} from "@angular/core";
import { injectNgControl } from "@tenzu/utils/injectors";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatFormField } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { ReactiveFormsModule } from "@angular/forms";
import { Role } from "@tenzu/repository/membership";
import { ProjectRoleRepositoryService } from "@tenzu/repository/project-roles";
import { WorkspaceRoleRepositoryService } from "@tenzu/repository/workspace-roles";
import { NoopValueAccessorDirective } from "@tenzu/directives/noop-value-accessor.directive";
import { MatTooltip } from "@angular/material/tooltip";
import { toObservable } from "@angular/core/rxjs-interop";
import { filterNotNull } from "@tenzu/utils/functions/rxjs.operators";

@Component({
  selector: "app-role-selector-field",
  hostDirectives: [NoopValueAccessorDirective],
  imports: [ReactiveFormsModule, TranslocoDirective, MatFormField, MatSelectModule, MatTooltip],
  template: `
    <mat-form-field *transloco="let t" appearance="outline">
      <mat-select [formControl]="ngControl.control">
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
export class RoleSelectorFieldComponent implements OnInit {
  injector = inject(Injector);
  ngControl = injectNgControl();
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

    if (!this.ngControl.control.disabled && !this.userRole()?.isOwner) {
      if (this.ngControl.control.value === roleRepositoryService.ownerRole()?.id) {
        this.ngControl.control.disable({ onlySelf: true, emitEvent: false });
      } else {
        roles = roles.filter((role) => !role.isOwner);
      }
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

  ngOnInit(): void {
    runInInjectionContext(this.injector, () => {
      toObservable(this.defaultRole)
        .pipe(filterNotNull())
        .subscribe((defaultRole) => {
          if (!this.ngControl.control.value) {
            this.ngControl.control.setValue(defaultRole.id);
          }
        });
    });
  }
}
