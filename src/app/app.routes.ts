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

import { Routes } from "@angular/router";
import { loginGuard } from "./guards/login.guard";
import { provideTranslocoScope } from "@jsverse/transloco";
import { WorkspaceInvitationGuard } from "./guards/workspace-invitation.guard";
import { VerifyEmailGuard } from "./guards/verify-email.guard";
import { ProjectInvitationGuard } from "./guards/project-invitation.guard";

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
    loadComponent: () =>
      import("@tenzu/shared/layouts/auth-layout/auth-layout.component").then((m) => m.AuthLayoutComponent),
    children: [
      {
        path: "login",
        loadComponent: () => import("./login/login.component").then((m) => m.LoginComponent),
        providers: [provideTranslocoScope("login")],
      },
      {
        path: "reset-password",
        loadChildren: () => import("./reset-password/routes").then((m) => m.routes),
      },
      {
        path: "signup",
        loadComponent: () => import("./signup/signup.component").then((m) => m.SignupComponent),
        providers: [provideTranslocoScope("signup")],
      },
    ],
  },
  {
    path: "**",
    loadComponent: () => import("./page404/page404.component"),
    providers: [provideTranslocoScope("errorPages")],
  },
];
