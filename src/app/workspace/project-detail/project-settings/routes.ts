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

import { ActivatedRouteSnapshot, Router, Routes } from "@angular/router";
import { provideTranslocoScope } from "@jsverse/transloco";
import { inject } from "@angular/core";
import { ProjectRoleRepositoryService } from "@tenzu/repository/project-roles";
import { HttpErrorResponse } from "@angular/common/http";

function getProjectRoleResolver(route: ActivatedRouteSnapshot) {
  const roleId = route.paramMap.get("roleId");
  const router = inject(Router);
  const projectRoleRepositoryService = inject(ProjectRoleRepositoryService);
  if (roleId) {
    projectRoleRepositoryService
      .getRequest({ roleId })
      .then()
      .catch((error) => {
        if (error instanceof HttpErrorResponse && (error.status === 404 || error.status === 422)) {
          return router.navigate(["/404"]);
        }
        throw error;
      });
  }
}

const routes: Routes = [
  {
    path: "",
    redirectTo: "project-edit",
    pathMatch: "prefix",
  },
  {
    path: "create-role",
    loadComponent: () => import("./role/crud-role/create-role/create-role.component"),
    providers: [provideTranslocoScope("project")],
  },
  {
    path: "edit-role/:roleId",
    loadComponent: () => import("./role/crud-role/edit-role/edit-role.component"),
    providers: [provideTranslocoScope("project")],
    resolve: {
      projectRole: getProjectRoleResolver,
    },
  },
  {
    path: "project-edit",
    loadComponent: () => import("./project-edit/project-edit.component"),
    providers: [provideTranslocoScope("project")],
  },
  {
    path: "list-project-roles",
    loadComponent: () => import("./role/list-project-roles/list-project-roles.component"),
    providers: [provideTranslocoScope("project")],
  },
];

export default routes;
