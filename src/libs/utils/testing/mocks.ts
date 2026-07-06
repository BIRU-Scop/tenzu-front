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

import { Type } from "@angular/core";
import { Mocked, vi } from "vitest";

/**
 * Builds a fully typed mock of a service class: every method on its prototype
 * chain (own + inherited) becomes a `vi.fn()`. Intended to stub a service at the
 * I/O boundary (e.g. an `*-api.service`) in repository/orchestration tests.
 *
 * Each method returns `undefined` by default — configure the ones a test
 * exercise:
 *
 *   const api = mockService(StoryApiService);
 *   TestBed.configureTestingModule({ providers: [{ provide: StoryApiService, useValue: api }] });
 *   api.list.mockReturnValue(of([...]));
 *
 * Note: only prototype methods are stubbed. Arrow-function class fields (instance
 * properties) are not on the prototype and won't be mocked; getters are skipped
 * so they are never invoked.
 */
export function mockService<T>(type: Type<T>): Mocked<T> {
  const mock: Record<string, unknown> = {};
  let proto: object | null = type.prototype;
  while (proto && proto !== Object.prototype) {
    for (const key of Object.getOwnPropertyNames(proto)) {
      if (key === "constructor" || key in mock) {
        continue;
      }
      const descriptor = Object.getOwnPropertyDescriptor(proto, key);
      if (descriptor && typeof descriptor.value === "function") {
        mock[key] = vi.fn();
      }
    }
    proto = Object.getPrototypeOf(proto);
  }
  return mock as Mocked<T>;
}
