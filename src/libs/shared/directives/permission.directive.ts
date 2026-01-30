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

import { Directive, effect, inject, Injector, input, Input, TemplateRef, ViewContainerRef } from "@angular/core";
import {
  hasEntityRequiredPermission,
  HasEntityRequiredPermissionConfig,
  PermissionService,
  RedirectIfNoPermissionServiceParams,
} from "@tenzu/repository/permission/permission.service";

@Directive({
  selector: "[appHasPermission]",
  standalone: true,
})
export class HasPermissionDirective {
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly templateRef = inject(TemplateRef<unknown>);

  readonly appHasPermission = input.required<HasEntityRequiredPermissionConfig>();
  readonly appHasPermissionElse = input<TemplateRef<unknown> | null>(null);

  constructor() {
    // The effect automatically reacts whenever 'appHasPermission' or 'appHasPermissionElse' changes
    effect(() => {
      const config = this.appHasPermission();
      const elseTemplate = this.appHasPermissionElse();
      const condition = hasEntityRequiredPermission(config);

      this.viewContainer.clear();

      if (condition) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else if (elseTemplate) {
        this.viewContainer.createEmbeddedView(elseTemplate);
      }
    });
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
