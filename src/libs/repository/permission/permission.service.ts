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

import { inject, Injectable, Injector, runInInjectionContext, Signal } from "@angular/core";
import { WorkspaceRepositoryService } from "../workspace";
import { ProjectRepositoryService } from "../project";
import { toObservable } from "@angular/core/rxjs-interop";
import { tap } from "rxjs";
import { NavigationExtras, Router } from "@angular/router";
import { filterNotNull } from "@tenzu/utils/functions/rxjs.operators";
import { EntityId } from "@ngrx/signals/entities";
import { UserRole, Permission, MemberPermission } from "@tenzu/repository/membership";

type EntityRole = UserRole & {
  id: EntityId;
};
export type RedirectIfNoPermissionParams = {
  expectedId: EntityId;
  requiredPermission: Permission;
  redirectUrl?: string[];
  redirectUrlExtras?: NavigationExtras;
};
export type hasPermissionParams = {
  expectedId: EntityId;
  actualEntity?: EntityRole;
  requiredPermission: Permission;
};

export type HasEntityRequiredPermissionConfig = {
  actualEntity: EntityRole;
  requiredPermission: Permission;
};

export function hasEntityRequiredPermission({ actualEntity, requiredPermission }: HasEntityRequiredPermissionConfig) {
  if (requiredPermission == MemberPermission) {
    return !!actualEntity?.userRole;
  }
  const userPermissions = actualEntity?.userRole?.permissions ?? [];
  return userPermissions.includes(requiredPermission);
}

export function hasPermission({ expectedId, actualEntity, requiredPermission }: hasPermissionParams) {
  if (expectedId !== actualEntity?.id) {
    return undefined;
  }
  return hasEntityRequiredPermission({ actualEntity, requiredPermission });
}

export function redirectIfNoPermission({
  expectedId,
  expectedEntity,
  redirectUrl,
  requiredPermission,
  redirectUrlExtras,
}: RedirectIfNoPermissionParams & { expectedEntity: Signal<EntityRole | undefined> }) {
  const router = inject(Router);
  return toObservable(expectedEntity)
    .pipe(
      filterNotNull(),
      tap((actualEntity) => {
        if (
          hasPermission({
            expectedId,
            actualEntity,
            requiredPermission,
          })
        ) {
          return;
        }
        router.navigate(redirectUrl || ["/"], redirectUrlExtras).then();
      }),
    )
    .subscribe();
}

export type RedirectIfNoPermissionServiceParams = RedirectIfNoPermissionParams & {
  type: "workspace" | "project";
};

@Injectable({
  providedIn: "root",
})
export class PermissionService {
  workspaceService = inject(WorkspaceRepositoryService);
  projectService = inject(ProjectRepositoryService);
  router = inject(Router);

  redirectIfNoPermission(
    injector: Injector,
    { expectedId, redirectUrl, redirectUrlExtras, requiredPermission, type }: RedirectIfNoPermissionServiceParams,
  ) {
    let expectedEntity: Signal<EntityRole | undefined>;
    if (type === "workspace") {
      expectedEntity = this.workspaceService.entityDetail;
    } else if (type === "project") {
      expectedEntity = this.projectService.entityDetail;
    } else {
      throw new Error(`Unknown type ${type}`);
    }
    runInInjectionContext(injector, () => {
      redirectIfNoPermission({
        expectedId,
        redirectUrl,
        requiredPermission,
        expectedEntity,
        redirectUrlExtras,
      });
    });
  }
}
