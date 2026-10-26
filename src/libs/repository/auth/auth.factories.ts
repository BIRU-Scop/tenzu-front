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

import { ExitReason, SessionState } from "./session/session-machine";
import { Tokens } from "./auth.model";

export const HOUR_MS = 60 * 60 * 1000;

function base64Url(value: object): string {
  return btoa(JSON.stringify(value)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export function makeJwt({
  username = "1user",
  exp = new Date(Date.now() + HOUR_MS),
}: { username?: string; exp?: Date } = {}): string {
  return `${base64Url({ alg: "none", typ: "JWT" })}.${base64Url({ username, exp: Math.floor(exp.getTime() / 1000) })}.signature`;
}

export function makeTokens({
  username = "1user",
  accessExp = new Date(Date.now() + HOUR_MS),
  refreshExp = new Date(Date.now() + 24 * HOUR_MS),
  ...overrides
}: Partial<Tokens> & { accessExp?: Date; refreshExp?: Date } = {}): Tokens {
  return {
    access: makeJwt({ username, exp: accessExp }),
    refresh: makeJwt({ username, exp: refreshExp }),
    username,
    ...overrides,
  };
}

export function makeLoggedOut(): SessionState {
  return { step: "loggedOut", context: { username: null } };
}

export function makeLoggedIn({ username = "1user" }: { username?: string } = {}): SessionState {
  return { step: "loggedIn", context: { username } };
}

export function makeTearingDown({
  username = "1user",
  reason = "refreshExpired",
  preserveNext = true,
  fromChannel = false,
}: { username?: string; reason?: ExitReason; preserveNext?: boolean; fromChannel?: boolean } = {}): SessionState {
  return { step: "tearingDown", context: { username, reason, preserveNext, fromChannel } };
}
