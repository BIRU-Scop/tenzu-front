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

export type TokenStep = "empty" | "held" | "rotating";

export type TokenInvalidation = "refreshExpired" | "refreshRefused" | "tokensCleared" | "accountSwitched";

export type TokenState =
  | MachineState<"empty", { tokens: null; invalidation: TokenInvalidation | null }>
  | MachineState<"held", { tokens: Tokens }>
  | MachineState<"rotating", { tokens: Tokens; refreshBeforeLock: string }>;

export type TokenContext = TokenState["context"];

export type TokenEvent =
  | { type: "set"; tokens: Tokens }
  | { type: "clear"; revoke: boolean }
  | { type: "storageChanged"; tokens: Tokens | null }
  | { type: "rotateRequested" }
  | { type: "rotated"; tokens: Tokens }
  | { type: "reused"; tokens: Tokens }
  | { type: "rotateFailed"; error: unknown }
  | { type: "refreshRefused" }
  | { type: "refreshExpired" };

export const RULES: Rules<TokenStep> = {
  empty: ["held"],
  held: ["held", "rotating", "empty"],
  rotating: ["held", "empty"],
};

function empty(invalidation: TokenInvalidation | null): TokenState {
  return { step: "empty", context: { tokens: null, invalidation } };
}

function held(tokens: Tokens): TokenState {
  return { step: "held", context: { tokens } };
}

export const transitions: Transitions<TokenState, TokenEvent> = {
  set: (state, event) => (state.step === "rotating" ? null : held(event.tokens)),
  clear: (state) => (state.step === "empty" ? null : empty(null)),
  storageChanged: (state, event) => {
    if (state.step === "empty") {
      return null;
    }
    if (event.tokens === null) {
      return empty("tokensCleared");
    }
    if (event.tokens.username !== state.context.tokens.username) {
      return empty("accountSwitched");
    }
    return state.step === "rotating" ? null : held(event.tokens);
  },
  rotateRequested: (state) =>
    state.step === "held"
      ? { step: "rotating", context: { tokens: state.context.tokens, refreshBeforeLock: state.context.tokens.refresh } }
      : null,
  rotated: (state, event) => (state.step === "rotating" ? held(event.tokens) : null),
  reused: (state, event) => (state.step === "rotating" ? held(event.tokens) : null),
  rotateFailed: (state) => (state.step === "rotating" ? held(state.context.tokens) : null),
  refreshRefused: (state) => (state.step === "rotating" ? empty("refreshRefused") : null),
  refreshExpired: (state) => (state.step === "held" ? empty("refreshExpired") : null),
};
