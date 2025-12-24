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

import { HttpParams } from "@angular/common/http";
import { MonoTypeOperatorFunction, throwError, timer } from "rxjs";
import { retry } from "rxjs/operators";

export type QueryParams = Record<string, string | number | (string | number)[] | boolean | null>;
export const makeOptions = (params: QueryParams) => {
  let options = new HttpParams();
  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      if (Array.isArray(params[key])) {
        (params[key] as (string | number)[]).forEach((element) => {
          if (element !== null && element !== undefined) {
            options = options.append(key, element.toString());
          }
        });
      } else {
        if (params[key] !== undefined) {
          options = options.append(key, params[key]?.toString() || "null");
        }
      }
    }
  }
  return options;
};

export function retryWhenErrors<T>(): MonoTypeOperatorFunction<T> {
  return retry({
    count: 3,
    delay: (error, retryCount) => {
      const status = error?.status;
      if (!(status === 0 || status === 429 || status === 424 || (status >= 500 && status < 600))) {
        return throwError(() => error);
      }
      const backoff = Math.min(100 * Math.pow(2, retryCount - 1), 400);
      return timer(backoff);
    },
  });
}
