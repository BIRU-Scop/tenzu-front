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

import {
  EXIT_REASON_STRENGTH,
  PRESERVES_NEXT,
  ExitReason,
  RULES,
  SessionEvent,
  SessionState,
  transitions,
} from "./session-machine";
import { makeLoggedIn, makeLoggedOut, makeTearingDown, makeTokens } from "../auth.factories";

const REASONS = Object.keys(EXIT_REASON_STRENGTH) as ExitReason[];
const REASON_PAIRS = REASONS.flatMap((current) => REASONS.map((received) => ({ current, received })));
const strengthOf = (reason: ExitReason) => EXIT_REASON_STRENGTH[reason];

describe("session machine transitions", () => {
  describe("transitions.sessionStarted", () => {
    const event: SessionEvent = { type: "sessionStarted", tokens: makeTokens({ username: "alice" }), next: null };

    it("sessionStarted returns loggedIn with the username of the tokens from loggedOut", () => {
      const tokens = makeTokens({ username: "alice" });

      const next = transitions.sessionStarted(makeLoggedOut(), { type: "sessionStarted", tokens, next: null });

      expect(next).toEqual({ step: "loggedIn", context: { username: "alice" } });
    });

    it("sessionStarted returns null from loggedIn", () => {
      expect(transitions.sessionStarted(makeLoggedIn(), event)).toBeNull();
    });

    it("sessionStarted returns null from tearingDown", () => {
      expect(transitions.sessionStarted(makeTearingDown(), event)).toBeNull();
    });
  });

  describe("transitions.exit from loggedIn", () => {
    it.each(REASONS.map((reason) => ({ reason, preserveNext: PRESERVES_NEXT[reason] })))(
      "exit returns tearingDown with the reason and preserveNext $preserveNext for $reason",
      ({ reason, preserveNext }) => {
        const next = transitions.exit(makeLoggedIn({ username: "alice" }), { type: "exit", reason });

        expect(next).toEqual({
          step: "tearingDown",
          context: { username: "alice", reason, preserveNext, fromChannel: false },
        });
      },
    );

    it("exit returns tearingDown with preserveNext from the event when the event carries one", () => {
      const next = transitions.exit(makeLoggedIn(), { type: "exit", reason: "refreshExpired", preserveNext: false });

      expect(next?.context).toMatchObject({ preserveNext: false });
    });

    it("exit returns tearingDown with fromChannel from the event", () => {
      const next = transitions.exit(makeLoggedIn(), { type: "exit", reason: "logoutRequested", fromChannel: true });

      expect(next?.context).toMatchObject({ fromChannel: true });
    });

    it("exit returns tearingDown with the username of the state", () => {
      const next = transitions.exit(makeLoggedIn({ username: "bob" }), { type: "exit", reason: "refreshExpired" });

      expect(next?.context).toMatchObject({ username: "bob" });
    });
  });

  describe("transitions.exit from tearingDown", () => {
    it.each(REASON_PAIRS.filter(({ current, received }) => strengthOf(received) > strengthOf(current)))(
      "exit returns tearingDown with the received reason when it has a higher strength than the current one ($current, $received)",
      ({ current, received }) => {
        const next = transitions.exit(makeTearingDown({ reason: current }), { type: "exit", reason: received });

        expect(next?.context).toMatchObject({ reason: received });
      },
    );

    it.each(REASON_PAIRS.filter(({ current, received }) => strengthOf(received) < strengthOf(current)))(
      "exit returns null when the received reason has a lower strength than the current one ($current, $received)",
      ({ current, received }) => {
        expect(transitions.exit(makeTearingDown({ reason: current }), { type: "exit", reason: received })).toBeNull();
      },
    );

    it.each(REASONS)("exit returns null when the received reason is the current one (%s)", (reason) => {
      expect(transitions.exit(makeTearingDown({ reason }), { type: "exit", reason })).toBeNull();
    });

    it.each(
      REASON_PAIRS.filter(
        ({ current, received }) => current !== received && strengthOf(received) === strengthOf(current),
      ),
    )(
      "exit returns null when the received reason has the same strength as the current one ($current, $received)",
      ({ current, received }) => {
        expect(transitions.exit(makeTearingDown({ reason: current }), { type: "exit", reason: received })).toBeNull();
      },
    );

    it("exit returns tearingDown with preserveNext of the received reason when it replaces the current one", () => {
      const next = transitions.exit(makeTearingDown({ reason: "logoutRequested", preserveNext: false }), {
        type: "exit",
        reason: "refreshExpired",
      });

      expect(next?.context).toMatchObject({ preserveNext: true });
    });
  });

  describe("transitions.exit from loggedOut", () => {
    it.each(REASONS)("exit returns null from loggedOut for %s", (reason) => {
      expect(transitions.exit(makeLoggedOut(), { type: "exit", reason })).toBeNull();
    });
  });

  describe("transitions.teardownDone", () => {
    const event: SessionEvent = { type: "teardownDone" };

    it("teardownDone returns loggedOut with username null from tearingDown", () => {
      expect(transitions.teardownDone(makeTearingDown(), event)).toEqual({
        step: "loggedOut",
        context: { username: null },
      });
    });

    it("teardownDone returns null from loggedIn", () => {
      expect(transitions.teardownDone(makeLoggedIn(), event)).toBeNull();
    });

    it("teardownDone returns null from loggedOut", () => {
      expect(transitions.teardownDone(makeLoggedOut(), event)).toBeNull();
    });
  });

  describe("RULES", () => {
    it("RULES contains the step of every state returned by a transition", () => {
      const states: SessionState[] = [
        makeLoggedOut(),
        makeLoggedIn(),
        ...REASONS.map((reason) => makeTearingDown({ reason })),
      ];
      const events: SessionEvent[] = [
        { type: "sessionStarted", tokens: makeTokens(), next: null },
        ...REASONS.map((reason): SessionEvent => ({ type: "exit", reason })),
        { type: "teardownDone" },
      ];
      const returned = states.flatMap((state) =>
        events.map((event) => ({
          from: state.step,
          to: (transitions[event.type] as (state: SessionState, event: SessionEvent) => SessionState | null)(
            state,
            event,
          )?.step,
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
