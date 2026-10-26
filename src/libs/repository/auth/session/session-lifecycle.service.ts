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

import { computed, inject, Service } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";

import { createMachine } from "@tenzu/utils/machine/machine";
import { HOMEPAGE_URL, LOGIN_URL, usableNext } from "@tenzu/utils/functions/urls";
import { WsService } from "@tenzu/utils/services/ws";
import { Tokens } from "../auth.model";
import { ExitReason, RULES, SessionEvent, SessionExitEvent, SessionState, transitions } from "./session-machine";
import { SessionChannelService } from "./session-channel.service";
import { TokenRepositoryService } from "../token/token-repository.service";
import { ExitReasonStore } from "../stores/exit-reason.store";
import { RememberedNextStore } from "../stores/remembered-next.store";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { ResetService } from "@tenzu/repository/base/reset.service";

const ANNOUNCED_ON_CHANNEL: Record<ExitReason, boolean> = {
  logoutRequested: true,
  passwordChanged: true,
  tokensCleared: false,
  accountSwitched: false,
  refreshRefused: true,
  refreshExpired: true,
  accountDeleted: true,
};

const REVOKES_REFRESH: Record<ExitReason, boolean> = {
  logoutRequested: true,
  passwordChanged: true,
  tokensCleared: false,
  accountSwitched: false,
  refreshRefused: false,
  refreshExpired: false,
  accountDeleted: false,
};

@Service()
export class SessionLifecycleService {
  private readonly tokenRepositoryService = inject(TokenRepositoryService);
  private readonly exitReasonStore = inject(ExitReasonStore);
  private readonly rememberedNextStore = inject(RememberedNextStore);
  private readonly sessionChannelService = inject(SessionChannelService);
  private readonly configAppService = inject(ConfigAppService);
  private readonly wsService = inject(WsService);
  private readonly matDialog = inject(MatDialog);
  private readonly resetService = inject(ResetService);
  private readonly router = inject(Router);

  private readonly machine = createMachine<SessionState, SessionEvent>({
    initial: this.initialState(),
    rules: RULES,
    transitions,
    onEnter: {
      loggedIn: (state, event) => this.onLoggedIn(state, event),
      tearingDown: (state, event, previous) => this.onTearingDown(state, previous),
      loggedOut: (state, event, previous) => this.onLoggedOut(previous),
    },
  });

  readonly step = computed(() => this.machine.state().step);

  constructor() {
    this.tokenRepositoryService.invalidated$
      .pipe(takeUntilDestroyed())
      .subscribe((invalidation) => this.endSession({ reason: invalidation }));
    this.sessionChannelService.ended$
      .pipe(takeUntilDestroyed())
      .subscribe((reason) => this.endSession({ reason, fromChannel: true }));
  }

  sessionStarted(tokens: Tokens, next: string | null = null): void {
    this.machine.dispatch({ type: "sessionStarted", tokens, next });
  }

  endSession(exit: Omit<SessionExitEvent, "type">): void {
    this.machine.dispatch({ type: "exit", ...exit });
  }

  private initialState(): SessionState {
    const tokens = this.tokenRepositoryService.tokens();
    return tokens !== null && this.tokenRepositoryService.hasUsableRefresh()
      ? { step: "loggedIn", context: { username: tokens.username } }
      : { step: "loggedOut", context: { username: null } };
  }

  private onLoggedIn(state: SessionState & { step: "loggedIn" }, event: SessionEvent): void {
    if (event.type !== "sessionStarted") {
      return;
    }
    this.tokenRepositoryService.set(event.tokens);
    this.configAppService.regenerateCorrelationId();
    this.wsService.command({ command: "signin", token: event.tokens.access });
    if (event.next !== null) {
      this.rememberedNextStore.remember(event.next, state.context.username);
    }
    const next = this.rememberedNextStore.take(state.context.username);
    this.router.navigateByUrl(next ?? HOMEPAGE_URL).then();
  }

  private onTearingDown(state: SessionState & { step: "tearingDown" }, previous: SessionState): void {
    if (previous.step === "tearingDown") {
      return;
    }
    this.wsService.command({ command: "signout_local" });
    if (!state.context.fromChannel && ANNOUNCED_ON_CHANNEL[state.context.reason]) {
      this.sessionChannelService.announceEnded(state.context.reason);
    }
    this.matDialog.closeAll();
    this.tokenRepositoryService.clear({ revoke: REVOKES_REFRESH[state.context.reason] && !state.context.fromChannel });
    this.resetService.reset();
    this.machine.dispatch({ type: "teardownDone" });
  }

  private onLoggedOut(previous: SessionState): void {
    if (previous.step !== "tearingDown") {
      return;
    }
    const { username, reason, preserveNext, fromChannel } = previous.context;
    this.exitReasonStore.remember(reason, fromChannel);
    const next = preserveNext ? usableNext(this.router.url) : null;
    if (next !== null) {
      this.rememberedNextStore.remember(next, username);
    }
    this.router.navigateByUrl(LOGIN_URL).then();
  }
}
