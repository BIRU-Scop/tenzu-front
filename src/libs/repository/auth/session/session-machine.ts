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

import { MachineState, Rules, Transitions } from "@tenzu/utils/machine/machine";
import { Tokens } from "../auth.model";

export type SessionStep = "loggedOut" | "loggedIn" | "tearingDown";

export const EXIT_REASONS = [
  "logoutRequested",
  "passwordChanged",
  "tokensCleared",
  "accountSwitched",
  "refreshRefused",
  "refreshExpired",
  "accountDeleted",
] as const;

export type ExitReason = (typeof EXIT_REASONS)[number];

export const EXIT_REASON_STRENGTH: Record<ExitReason, number> = {
  logoutRequested: 0,
  passwordChanged: 1,
  tokensCleared: 2,
  accountSwitched: 3,
  refreshRefused: 4,
  refreshExpired: 4,
  accountDeleted: 5,
};

export type SessionState =
  | MachineState<"loggedOut", { username: null }>
  | MachineState<"loggedIn", { username: string }>
  | MachineState<"tearingDown", { username: string; reason: ExitReason; preserveNext: boolean; fromChannel: boolean }>;

export type SessionContext = SessionState["context"];

export type SessionExitEvent = {
  type: "exit";
  reason: ExitReason;
  preserveNext?: boolean;
  fromChannel?: boolean;
};

export type SessionEvent =
  { type: "sessionStarted"; tokens: Tokens; next: string | null } | SessionExitEvent | { type: "teardownDone" };

export const RULES: Rules<SessionStep> = {
  loggedOut: ["loggedIn"],
  loggedIn: ["tearingDown"],
  tearingDown: ["tearingDown", "loggedOut"],
};

export const PRESERVES_NEXT: Record<ExitReason, boolean> = {
  logoutRequested: false,
  passwordChanged: false,
  tokensCleared: true,
  accountSwitched: false,
  refreshRefused: true,
  refreshExpired: true,
  accountDeleted: false,
};

function tearingDown(username: string, event: SessionExitEvent): SessionState {
  return {
    step: "tearingDown",
    context: {
      username,
      reason: event.reason,
      preserveNext: event.preserveNext ?? PRESERVES_NEXT[event.reason],
      fromChannel: event.fromChannel ?? false,
    },
  };
}

export const transitions: Transitions<SessionState, SessionEvent> = {
  sessionStarted: (state, event) =>
    state.step === "loggedOut" ? { step: "loggedIn", context: { username: event.tokens.username } } : null,
  exit: (state, event) => {
    if (state.step === "loggedOut") {
      return null;
    }
    if (state.step === "tearingDown") {
      const isStronger = EXIT_REASON_STRENGTH[event.reason] > EXIT_REASON_STRENGTH[state.context.reason];
      return isStronger ? tearingDown(state.context.username, event) : null;
    }
    return tearingDown(state.context.username, event);
  },
  teardownDone: (state) => (state.step === "tearingDown" ? { step: "loggedOut", context: { username: null } } : null),
};
