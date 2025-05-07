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

import { Directive, inject, Input, TemplateRef } from "@angular/core";
import { NgIf } from "@angular/common";
import { PermissionService } from "@tenzu/repository/permission/permission.service";
import { ProjectPermissions, WorkspacePermissions } from "@tenzu/repository/permission/permission.model";

@Directive({
  selector: "[appHasWorkspacePermission]",
  standalone: true,
  hostDirectives: [NgIf],
})
export class HasWorkspacePermissionDirective {
  private readonly permissionService = inject(PermissionService);
  private readonly ngIfRef = inject(NgIf);

  @Input()
  set appHasWorkspacePermission(permission: WorkspacePermissions) {
    this.ngIfRef.ngIf = this.permissionService.hasWorkspacePermission(permission);
  }

  @Input()
  set appHasWorkspacePermissionElse(template: TemplateRef<never>) {
    this.ngIfRef.ngIfElse = template;
  }
}

@Directive({
  selector: "[appHasProjectPermission]",
  standalone: true,
  hostDirectives: [NgIf],
})
export class HasProjectPermissionDirective {
  private readonly permissionService = inject(PermissionService);
  private readonly ngIfRef = inject(NgIf);

  @Input()
  set appHasProjectPermission(permission: ProjectPermissions) {
    this.ngIfRef.ngIf = this.permissionService.hasProjectPermission(permission);
  }

  @Input()
  set appHasProjectPermissionElse(template: TemplateRef<never>) {
    this.ngIfRef.ngIfElse = template;
  }
}
