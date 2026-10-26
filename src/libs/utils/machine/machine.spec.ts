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

import { describe, expect, it, vi } from "vitest";

import { createMachine, IllegalTransitionError, MachineState, OnEnter, Rules, Transitions } from "./machine";

type TestStep = "a" | "b";
type TestState = MachineState<TestStep, { moves: number }>;
type TestEvent = { type: "go" } | { type: "back" } | { type: "stay" } | { type: "jump" };

const stateA: TestState = { step: "a", context: { moves: 0 } };
const stateB: TestState = { step: "b", context: { moves: 1 } };
const RULES: Rules<TestStep> = { a: ["b"], b: ["a"] };
const transitions: Transitions<TestState, TestEvent> = {
  go: () => stateB,
  back: () => stateA,
  stay: () => null,
  jump: () => stateB,
};

function makeOnEnter(): OnEnter<TestState, TestEvent> {
  return { a: vi.fn(), b: vi.fn() };
}

function makeMachine(onEnter = makeOnEnter()) {
  return createMachine<TestState, TestEvent>({ initial: stateA, rules: RULES, transitions, onEnter });
}

describe(createMachine.name, () => {
  it("createMachine sets state to initial", () => {
    const machine = makeMachine();

    expect(machine.state()).toEqual(stateA);
  });

  it("createMachine does not call onEnter", () => {
    const onEnter = makeOnEnter();

    makeMachine(onEnter);

    expect(onEnter.a).not.toHaveBeenCalled();
    expect(onEnter.b).not.toHaveBeenCalled();
  });

  it("dispatch sets state to the state returned by the transition of the event", () => {
    const machine = makeMachine();

    machine.dispatch({ type: "go" });

    expect(machine.state()).toEqual(stateB);
  });

  it("dispatch calls onEnter of the target step with the new state, the event and the previous state", () => {
    const onEnter = makeOnEnter();
    const machine = makeMachine(onEnter);

    machine.dispatch({ type: "go" });

    expect(onEnter.b).toHaveBeenCalledExactlyOnceWith(stateB, { type: "go" }, stateA);
  });

  it("dispatch sets state before calling onEnter", () => {
    const onEnter = makeOnEnter();
    const machine = makeMachine(onEnter);
    const stateOnEnter = vi.fn();
    vi.mocked(onEnter.b).mockImplementation(() => stateOnEnter(machine.state()));

    machine.dispatch({ type: "go" });

    expect(stateOnEnter).toHaveBeenCalledExactlyOnceWith(stateB);
  });

  it("dispatch leaves state unchanged when the transition returns null", () => {
    const machine = makeMachine();

    machine.dispatch({ type: "stay" });

    expect(machine.state()).toEqual(stateA);
  });

  it("dispatch does not call onEnter when the transition returns null", () => {
    const onEnter = makeOnEnter();
    const machine = makeMachine(onEnter);

    machine.dispatch({ type: "stay" });

    expect(onEnter.a).not.toHaveBeenCalled();
    expect(onEnter.b).not.toHaveBeenCalled();
  });

  it("dispatch throws IllegalTransitionError when the target step is not in the rules of the current step", () => {
    const machine = makeMachine();
    machine.dispatch({ type: "go" });

    expect(() => machine.dispatch({ type: "jump" })).toThrow(IllegalTransitionError);
  });

  it("dispatch leaves state unchanged when it throws IllegalTransitionError", () => {
    const machine = makeMachine();
    machine.dispatch({ type: "go" });

    expect(() => machine.dispatch({ type: "jump" })).toThrow(IllegalTransitionError);

    expect(machine.state()).toEqual(stateB);
  });

  it("dispatch made from onEnter calls onEnter with the state set by the outer dispatch as previous state", () => {
    const onEnter = makeOnEnter();
    const machine = makeMachine(onEnter);
    vi.mocked(onEnter.b).mockImplementation(() => machine.dispatch({ type: "back" }));

    machine.dispatch({ type: "go" });

    expect(onEnter.a).toHaveBeenCalledExactlyOnceWith(stateA, { type: "back" }, stateB);
  });
});
