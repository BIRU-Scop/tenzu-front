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
import { provideTranslocoScope } from "@jsverse/transloco";

export const routes: Routes = [
  {
    path: "login",
    loadComponent: () => import("./login/login.component"),
    providers: [provideTranslocoScope("login")],
  },
  {
    path: "reset-password",
    loadChildren: () => import("./reset-password/routes").then((m) => m.routes),
  },
  {
    path: "signup",
    loadComponent: () => import("./signup/signup.component"),
    providers: [provideTranslocoScope("signup")],
  },
];
