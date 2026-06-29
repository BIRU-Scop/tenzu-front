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

import { HttpErrorResponse, HttpRequest, HttpResponse } from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";

export type MockHandler = (req: HttpRequest<unknown>) => Observable<HttpResponse<unknown>> | null;

/**
 * Declarative descriptor of a mocked route.
 *
 * `urlMatch` accepts three forms:
 * - simple suffix (`"/feeds"`)
 * - path pattern with tokens `":param"` (`"/projects/:projectId/stories/:ref"`)
 * - predicate (`(url) => boolean`)
 */
export interface MockDescriptor {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  urlMatch: string | ((url: string) => boolean);
  status?: number;
  respond: (req: HttpRequest<unknown>, params: Record<string, string>) => unknown;
}

export interface MockDomain {
  name: string;
  handlers: MockHandler[];
}

export function matchPath(pattern: string, url: string): Record<string, string> | null {
  const patternPathSegments = pattern.split("/").filter(Boolean);
  const urlPathSegments = url.split("?")[0].split("/").filter(Boolean);
  if (urlPathSegments.length < patternPathSegments.length) {
    return null;
  }
  const urlPathSuffixSegments = urlPathSegments.slice(urlPathSegments.length - patternPathSegments.length);
  const capturedParams: Record<string, string> = {};
  for (let index = 0; index < patternPathSegments.length; index++) {
    const patternPathSegment = patternPathSegments[index];
    if (patternPathSegment.startsWith(":")) {
      capturedParams[patternPathSegment.slice(1)] = urlPathSuffixSegments[index];
    } else if (patternPathSegment !== urlPathSuffixSegments[index]) {
      return null;
    }
  }
  return capturedParams;
}

function matchUrl(urlMatch: MockDescriptor["urlMatch"], url: string): Record<string, string> | null {
  if (typeof urlMatch === "function") {
    return urlMatch(url) ? {} : null;
  }
  if (urlMatch.includes(":")) {
    return matchPath(urlMatch, url);
  }
  return url.split("?")[0].endsWith(urlMatch) ? {} : null;
}

export function defineMock(descriptor: MockDescriptor): MockHandler {
  return (req) => {
    if (req.method !== descriptor.method) {
      return null;
    }
    const capturedParams = matchUrl(descriptor.urlMatch, req.url);
    if (capturedParams === null) {
      return null;
    }
    const responseStatus = descriptor.status ?? 200;
    const responseBody = descriptor.respond(req, capturedParams);
    return responseStatus >= 400
      ? throwError(() => new HttpErrorResponse({ status: responseStatus, error: responseBody, url: req.url }))
      : of(new HttpResponse({ status: responseStatus, body: responseBody }));
  };
}
