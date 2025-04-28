/*
 * Copyright (C) 2024 BIRU
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

import { ActivatedRouteSnapshot, BaseRouteReuseStrategy, Routes } from "@angular/router";
import { loginGuard } from "./guards/login.guard";
import { provideTranslocoScope } from "@jsverse/transloco";
import { WorkspaceInvitationGuard } from "./guards/workspace-invitation.guard";
import { VerifyEmailGuard } from "./guards/verify-email.guard";
import { ProjectInvitationGuard } from "./guards/project-invitation.guard";
import { redirectHomepageGuard } from "./guards/redirect-homepage.guard";

function isViewSetterKanbanStory(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot) {
  const story = "story/:ref";
  const workflow = "kanban/:workflowSlug";

  const urls = [story, workflow];

  const findUrl = (it: ActivatedRouteSnapshot): boolean => {
    const found = !!urls.find((url) => it.routeConfig?.path === url);
    if (found) {
      return true;
    } else if (it.parent) {
      return findUrl(it.parent);
    } else {
      return false;
    }
  };

  return findUrl(future) && findUrl(curr);
}

export class CustomReuseStrategy extends BaseRouteReuseStrategy {
  override shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot) {
    if (isViewSetterKanbanStory(future, curr)) {
      return true;
    }

    return future.routeConfig === curr.routeConfig;
  }
}

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./home/home.component"),
    providers: [provideTranslocoScope("home")],
    canActivate: [loginGuard],
    canActivateChild: [loginGuard],
    children: [
      {
        path: "",
        loadChildren: () => import("./workspace/routes").then((m) => m.routes),
      },
      {
        path: "settings",
        loadChildren: () => import("./settings/routes").then((m) => m.routes),
      },
      {
        path: "new-project",
        loadComponent: () => import("./project/project-create/project-create.component"),
        providers: [provideTranslocoScope("project")],
      },
    ],
  },
  {
    path: "404",
    loadComponent: () => import("./page404/page404.component"),
    providers: [provideTranslocoScope("errorPages")],
  },
  {
    path: "accept-project-invitation/:token",
    children: [],
    canActivate: [ProjectInvitationGuard],
  },
  {
    path: "accept-workspace-invitation/:token",
    children: [],
    canActivate: [WorkspaceInvitationGuard],
  },
  {
    path: "signup/verify/:token",
    children: [],
    canActivate: [VerifyEmailGuard],
  },
  {
    path: "",
    loadComponent: () => import("./auth/auth-layout/auth-layout.component"),
    canActivateChild: [redirectHomepageGuard],
    children: [
      {
        path: "",
        loadChildren: () => import("./auth/routes").then((m) => m.routes),
      },
    ],
  },
  {
    path: "**",
    loadComponent: () => import("./page404/page404.component"),
    providers: [provideTranslocoScope("errorPages")],
  },
];
