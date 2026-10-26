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

import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { usableNext } from "@tenzu/utils/functions/urls";
import { TokenRepositoryService } from "@tenzu/repository/auth/token/token-repository.service";

export const loginGuard: CanActivateFn = async (route, state) => {
  const tokenRepositoryService = inject(TokenRepositoryService);
  const router = inject(Router);
  if ((await tokenRepositoryService.getAccessToken()) !== null) {
    return true;
  }
  const next = usableNext(state.url);
  return router.createUrlTree(["/login"], next ? { queryParams: { next } } : {});
};
