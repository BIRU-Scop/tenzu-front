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

import { signal, Signal } from "@angular/core";

export type MachineState<Step extends string, Context> = { step: Step; context: Context };

export type MachineEvent = { type: string };

export type Rules<Step extends string> = Record<Step, readonly Step[]>;

export type Transitions<State extends MachineState<string, unknown>, Event extends MachineEvent> = {
  [Type in Event["type"]]: (state: State, event: Extract<Event, { type: Type }>) => State | null;
};

export type OnEnter<State extends MachineState<string, unknown>, Event extends MachineEvent> = {
  [Step in State["step"]]: (state: Extract<State, { step: Step }>, event: Event, previous: State) => void;
};

export type MachineConfig<State extends MachineState<string, unknown>, Event extends MachineEvent> = {
  initial: State;
  rules: Rules<State["step"]>;
  transitions: Transitions<State, Event>;
  onEnter: OnEnter<State, Event>;
};

export type Machine<State extends MachineState<string, unknown>, Event extends MachineEvent> = {
  state: Signal<State>;
  dispatch(event: Event): void;
};

export class IllegalTransitionError extends Error {
  constructor(from: string, to: string, eventType: string) {
    super(`Illegal transition from ${from} to ${to} on ${eventType}`);
  }
}

function transitionOf<State extends MachineState<string, unknown>, Event extends MachineEvent>(
  transitions: Transitions<State, Event>,
  event: Event,
): (state: State, event: Event) => State | null {
  return transitions[event.type as Event["type"]] as (state: State, event: Event) => State | null;
}

function onEnterOf<State extends MachineState<string, unknown>, Event extends MachineEvent>(
  onEnter: OnEnter<State, Event>,
  next: State,
): (state: State, event: Event, previous: State) => void {
  return onEnter[next.step as State["step"]] as (state: State, event: Event, previous: State) => void;
}

export function createMachine<State extends MachineState<string, unknown>, Event extends MachineEvent>(
  config: MachineConfig<State, Event>,
): Machine<State, Event> {
  const state = signal<State>(config.initial);
  return {
    state: state.asReadonly(),
    dispatch: (event) => {
      const previous = state();
      const next = transitionOf(config.transitions, event)(previous, event);
      if (next === null) {
        return;
      }
      if (!config.rules[previous.step as State["step"]].includes(next.step)) {
        throw new IllegalTransitionError(previous.step, next.step, event.type);
      }
      state.set(next);
      onEnterOf(config.onEnter, next)(next, event, previous);
    },
  };
}
