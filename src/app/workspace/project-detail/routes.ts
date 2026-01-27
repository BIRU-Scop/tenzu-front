/*
 * Copyright (C) 2024-2026 BIRU
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
import { provideTranslocoScope } from "@jsverse/transloco";

export const routes: Routes = [
  {
    path: "kanban/:workflowSlug",
    loadComponent: () => import("./kanban-wrapper/kanban-wrapper.component"),
    providers: [provideTranslocoScope("workflow")],
    data: { reuseComponent: true },
  },
  {
    path: "story/:storyRef",
    loadComponent: () => import("./kanban-wrapper/kanban-wrapper.component"),
    providers: [provideTranslocoScope("workflow")],
    data: { reuseComponent: true },
  },
  {
    path: "new-workflow",
    loadComponent: () => import("./project-kanban-create/project-kanban-create.component"),
    providers: [provideTranslocoScope("workflow")],
  },
  {
    path: "members",
    children: [
      {
        path: "",
        loadComponent: () => import("./project-members/project-members.component"),
        loadChildren: () => import("./project-members/routes"),
      },
    ],
    providers: [provideTranslocoScope("project")],
  },
  {
    path: "settings",
    children: [
      {
        path: "",
        loadComponent: () => import("./project-settings/project-settings.component"),
        loadChildren: () => import("./project-settings/routes"),
      },
    ],
    providers: [provideTranslocoScope("project")],
  },
];
