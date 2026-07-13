/*
 * Copyright (C) 2026 BIRU
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

import { HttpInterceptorFn } from "@angular/common/http";
import { debug } from "@tenzu/utils/functions/logging";
import { MOCK_DOMAINS } from "./mock-handlers";
import { DomainMockStore } from "./mock-state";
import { inject } from "@angular/core";

export const mockInterceptor: HttpInterceptorFn = (req, next) => {
  const mockStore = inject(DomainMockStore);
  if (!mockStore.anyDomainMocked()) return next(req);
  for (const { name, handlers } of MOCK_DOMAINS) {
    if (!mockStore.isDomainMocked(name)) {
      continue;
    }
    for (const handler of handlers) {
      const mockedResponse = handler(req);
      if (mockedResponse) {
        debug("MOCK", `mocked[${name}]: ${req.method} ${req.url}`);
        return mockedResponse;
      }
    }
  }
  return next(req);
};
