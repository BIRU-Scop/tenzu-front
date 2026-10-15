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

import { describe, expect, it } from "vitest";

import { RULES, TokenEvent, TokenInvalidation, TokenState, transitions } from "./token-machine";
import { makeTokens } from "../auth.factories";
import { Tokens } from "../auth.model";

const tokens = makeTokens({ username: "alice" });
const otherTokens = makeTokens({ username: "alice", refresh: "refresh-token-2" });
const otherAccountTokens = makeTokens({ username: "bob" });

function makeEmpty(invalidation: TokenInvalidation | null = null): TokenState {
  return { step: "empty", context: { tokens: null, invalidation } };
}

function makeHeld(held: Tokens = tokens): TokenState {
  return { step: "held", context: { tokens: held } };
}

function makeRotating(rotating: Tokens = tokens): TokenState {
  return { step: "rotating", context: { tokens: rotating, refreshBeforeLock: rotating.refresh } };
}

describe("token machine transitions", () => {
  describe("transitions.set", () => {
    const event: TokenEvent = { type: "set", tokens };

    it("set returns held with the tokens from empty", () => {
      expect(transitions.set(makeEmpty(), event)).toEqual(makeHeld(tokens));
    });

    it("set returns held with the tokens from held", () => {
      expect(transitions.set(makeHeld(otherTokens), event)).toEqual(makeHeld(tokens));
    });

    it("set returns null from rotating", () => {
      expect(transitions.set(makeRotating(), event)).toBeNull();
    });
  });

  describe("transitions.clear", () => {
    it("clear returns empty with invalidation null from rotating", () => {
      expect(transitions.clear(makeRotating(), { type: "clear", revoke: false })).toEqual(makeEmpty(null));
    });

    it("clear returns null from empty", () => {
      expect(transitions.clear(makeEmpty(), { type: "clear", revoke: false })).toBeNull();
    });

    it.each([true, false])("clear returns empty with invalidation null from held for revoke %s", (revoke) => {
      expect(transitions.clear(makeHeld(), { type: "clear", revoke })).toEqual(makeEmpty(null));
    });
  });

  describe("transitions.storageChanged", () => {
    it("storageChanged with null returns empty with invalidation tokensCleared from held", () => {
      expect(transitions.storageChanged(makeHeld(), { type: "storageChanged", tokens: null })).toEqual(
        makeEmpty("tokensCleared"),
      );
    });

    it("storageChanged with null returns empty with invalidation tokensCleared from rotating", () => {
      expect(transitions.storageChanged(makeRotating(), { type: "storageChanged", tokens: null })).toEqual(
        makeEmpty("tokensCleared"),
      );
    });

    it("storageChanged with null returns null from empty", () => {
      expect(transitions.storageChanged(makeEmpty(), { type: "storageChanged", tokens: null })).toBeNull();
    });

    it("storageChanged with tokens of the same username returns held with the tokens from held", () => {
      expect(transitions.storageChanged(makeHeld(), { type: "storageChanged", tokens: otherTokens })).toEqual(
        makeHeld(otherTokens),
      );
    });

    it("storageChanged with tokens of the same username returns null from rotating", () => {
      expect(transitions.storageChanged(makeRotating(), { type: "storageChanged", tokens: otherTokens })).toBeNull();
    });

    it("storageChanged with tokens of the same username returns null from empty", () => {
      expect(transitions.storageChanged(makeEmpty(), { type: "storageChanged", tokens: otherTokens })).toBeNull();
    });

    it("storageChanged with tokens of another username returns empty with invalidation accountSwitched from held", () => {
      expect(transitions.storageChanged(makeHeld(), { type: "storageChanged", tokens: otherAccountTokens })).toEqual(
        makeEmpty("accountSwitched"),
      );
    });

    it("storageChanged with tokens of another username returns empty with invalidation accountSwitched from rotating", () => {
      expect(
        transitions.storageChanged(makeRotating(), { type: "storageChanged", tokens: otherAccountTokens }),
      ).toEqual(makeEmpty("accountSwitched"));
    });

    it("storageChanged with tokens of another username returns null from empty", () => {
      expect(
        transitions.storageChanged(makeEmpty(), { type: "storageChanged", tokens: otherAccountTokens }),
      ).toBeNull();
    });
  });

  describe("transitions.rotateRequested", () => {
    const event: TokenEvent = { type: "rotateRequested" };

    it("rotateRequested returns rotating with the tokens and refreshBeforeLock equal to their refresh from held", () => {
      expect(transitions.rotateRequested(makeHeld(), event)).toEqual({
        step: "rotating",
        context: { tokens, refreshBeforeLock: tokens.refresh },
      });
    });

    it("rotateRequested returns null from rotating", () => {
      expect(transitions.rotateRequested(makeRotating(), event)).toBeNull();
    });

    it("rotateRequested returns null from empty", () => {
      expect(transitions.rotateRequested(makeEmpty(), event)).toBeNull();
    });
  });

  describe("transitions.rotated, transitions.reused and transitions.rotateFailed", () => {
    it("rotated returns held with the tokens from rotating", () => {
      expect(transitions.rotated(makeRotating(), { type: "rotated", tokens: otherTokens })).toEqual(
        makeHeld(otherTokens),
      );
    });

    it("rotated returns null from held", () => {
      expect(transitions.rotated(makeHeld(), { type: "rotated", tokens: otherTokens })).toBeNull();
    });

    it("rotated returns null from empty", () => {
      expect(transitions.rotated(makeEmpty(), { type: "rotated", tokens: otherTokens })).toBeNull();
    });

    it("reused returns held with the tokens from rotating", () => {
      expect(transitions.reused(makeRotating(), { type: "reused", tokens: otherTokens })).toEqual(
        makeHeld(otherTokens),
      );
    });

    it("reused returns null from held", () => {
      expect(transitions.reused(makeHeld(), { type: "reused", tokens: otherTokens })).toBeNull();
    });

    it("reused returns null from empty", () => {
      expect(transitions.reused(makeEmpty(), { type: "reused", tokens: otherTokens })).toBeNull();
    });

    it("rotateFailed returns held with the tokens of the state from rotating", () => {
      expect(transitions.rotateFailed(makeRotating(), { type: "rotateFailed", error: new Error() })).toEqual(
        makeHeld(tokens),
      );
    });

    it("rotateFailed returns null from held", () => {
      expect(transitions.rotateFailed(makeHeld(), { type: "rotateFailed", error: new Error() })).toBeNull();
    });

    it("rotateFailed returns null from empty", () => {
      expect(transitions.rotateFailed(makeEmpty(), { type: "rotateFailed", error: new Error() })).toBeNull();
    });
  });

  describe("transitions.refreshRefused", () => {
    const event: TokenEvent = { type: "refreshRefused" };

    it("refreshRefused returns empty with invalidation refreshRefused from rotating", () => {
      expect(transitions.refreshRefused(makeRotating(), event)).toEqual(makeEmpty("refreshRefused"));
    });

    it("refreshRefused returns null from held", () => {
      expect(transitions.refreshRefused(makeHeld(), event)).toBeNull();
    });

    it("refreshRefused returns null from empty", () => {
      expect(transitions.refreshRefused(makeEmpty(), event)).toBeNull();
    });
  });

  describe("transitions.refreshExpired", () => {
    const event: TokenEvent = { type: "refreshExpired" };

    it("refreshExpired returns empty with invalidation refreshExpired from held", () => {
      expect(transitions.refreshExpired(makeHeld(), event)).toEqual(makeEmpty("refreshExpired"));
    });

    it("refreshExpired returns null from rotating", () => {
      expect(transitions.refreshExpired(makeRotating(), event)).toBeNull();
    });

    it("refreshExpired returns null from empty", () => {
      expect(transitions.refreshExpired(makeEmpty(), event)).toBeNull();
    });
  });

  describe("RULES", () => {
    it("RULES contains the step of every state returned by a transition", () => {
      const states: TokenState[] = [makeEmpty(), makeHeld(), makeRotating()];
      const events: TokenEvent[] = [
        { type: "set", tokens },
        { type: "clear", revoke: false },
        { type: "storageChanged", tokens: null },
        { type: "storageChanged", tokens: otherTokens },
        { type: "storageChanged", tokens: otherAccountTokens },
        { type: "rotateRequested" },
        { type: "rotated", tokens: otherTokens },
        { type: "reused", tokens: otherTokens },
        { type: "rotateFailed", error: new Error() },
        { type: "refreshRefused" },
        { type: "refreshExpired" },
      ];
      const returned = states.flatMap((state) =>
        events.map((event) => ({
          from: state.step,
          to: (transitions[event.type] as (state: TokenState, event: TokenEvent) => TokenState | null)(state, event)
            ?.step,
        })),
      );

      for (const { from, to } of returned) {
        if (to !== undefined) {
          expect(RULES[from]).toContain(to);
        }
      }
    });
  });
});
