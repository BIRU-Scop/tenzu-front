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

import { Directive, inject, Injector, Input, TemplateRef } from "@angular/core";
import { NgIf } from "@angular/common";
import {
  hasEntityRequiredPermission,
  HasEntityRequiredPermissionConfig,
  PermissionService,
  RedirectIfNoPermissionServiceParams,
} from "@tenzu/repository/permission/permission.service";

@Directive({
  selector: "[appHasPermission]",
  standalone: true,
  hostDirectives: [NgIf],
})
export class HasPermissionDirective {
  private readonly ngIfRef = inject(NgIf);

  @Input({ required: true })
  set appHasPermission(config: HasEntityRequiredPermissionConfig) {
    this.ngIfRef.ngIf = hasEntityRequiredPermission(config);
  }

  @Input()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set appHasPermissionElse(template: TemplateRef<any>) {
    this.ngIfRef.ngIfElse = template;
  }
}

@Directive({
  selector: "[appPermissionOrRedirect]",
  standalone: true,
})
export class PermissionOrRedirectDirective {
  injector = inject(Injector, { self: true });
  private permissionService = inject(PermissionService);

  @Input()
  set appPermissionOrRedirect(config: RedirectIfNoPermissionServiceParams) {
    this.permissionService.redirectIfNoPermission(this.injector, config);
  }
}
