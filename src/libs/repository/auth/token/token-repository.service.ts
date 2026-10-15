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

import { computed, DestroyRef, ErrorHandler, inject, Service, Signal } from "@angular/core";
import { HttpErrorResponse, HttpStatusCode } from "@angular/common/http";
import { JwtHelperService } from "@auth0/angular-jwt";
import {
  catchError,
  EMPTY,
  lastValueFrom,
  Observable,
  of,
  retry,
  Subject,
  Subscription,
  switchMap,
  timeout,
} from "rxjs";

import { createMachine } from "@tenzu/utils/machine/machine";
import { CrossTabLockService } from "@tenzu/utils/services/cross-tab-lock/cross-tab-lock.service";
import { timerAt } from "@tenzu/utils/functions/timers";
import { Tokens, tokensSchema } from "../auth.model";
import { AuthService } from "../auth.service";
import { SESSION_KEY_PREFIX } from "../stores/session-storage";
import { RULES, TokenEvent, TokenInvalidation, TokenState, transitions } from "./token-machine";

export const REFRESH_LOCK_NAME = "tenzu-refresh";
export const TOKENS_KEY = `${SESSION_KEY_PREFIX}tokens`;
export const REVOCATION_TIMEOUT_MS = 3000;
export const REVOCATION_RETRY_COUNT = 2;

export class NoTokensError extends Error {
  constructor() {
    super("No tokens to rotate");
  }
}

export class TokenInvalidatedError extends Error {
  constructor(readonly invalidation: TokenInvalidation) {
    super(`Tokens invalidated: ${invalidation}`);
  }
}

function isExpired(jwtHelperService: JwtHelperService, token: string | undefined): boolean {
  if (token === undefined) {
    return true;
  }
  try {
    return jwtHelperService.isTokenExpired(token) as boolean;
  } catch {
    return true;
  }
}

function evictionDue(deadline: Date, storedExpiryAt: Signal<Date | null>): Observable<void> {
  return timerAt(deadline).pipe(
    switchMap(() => {
      const stored = storedExpiryAt();
      return stored && stored.getTime() > deadline.getTime() ? evictionDue(stored, storedExpiryAt) : of(undefined);
    }),
  );
}

@Service()
export class TokenRepositoryService {
  private readonly jwtHelperService = inject(JwtHelperService);
  private readonly authService = inject(AuthService);
  private readonly errorHandler = inject(ErrorHandler);
  private readonly crossTabLockService = inject(CrossTabLockService);

  private readonly invalidated = new Subject<TokenInvalidation>();
  readonly invalidated$ = this.invalidated.asObservable();

  private rotation: PromiseWithResolvers<Tokens> | null = null;
  private eviction: Subscription | null = null;

  private readonly machine = createMachine<TokenState, TokenEvent>({
    initial: this.initialState(),
    rules: RULES,
    transitions,
    onEnter: {
      empty: (state, event, previous) => this.onEmpty(state, event, previous),
      held: (state, event, previous) => this.onHeld(state, event, previous),
      rotating: (state) => this.onRotating(state),
    },
  });

  readonly step = computed(() => this.machine.state().step);
  readonly tokens = computed(() => this.machine.state().context.tokens);
  readonly hasUsableRefresh = computed(() => !isExpired(this.jwtHelperService, this.tokens()?.refresh));
  readonly isAccessExpired = computed(() => isExpired(this.jwtHelperService, this.tokens()?.access));
  readonly refreshExpiresAt = computed<Date | null>(() => {
    const refresh = this.tokens()?.refresh;
    if (refresh === undefined) {
      return null;
    }
    try {
      return this.jwtHelperService.getTokenExpirationDate(refresh);
    } catch {
      return null;
    }
  });

  constructor() {
    this.armEviction();
    const onStorage = (event: StorageEvent) => this.onStorage(event);
    window.addEventListener("storage", onStorage);
    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener("storage", onStorage);
      this.eviction?.unsubscribe();
      this.invalidated.complete();
    });
  }

  set(tokens: Tokens): void {
    this.machine.dispatch({ type: "set", tokens });
  }

  clear({ revoke = false }: { revoke?: boolean } = {}): void {
    this.machine.dispatch({ type: "clear", revoke });
  }

  rotate(): Promise<Tokens> {
    const state = this.machine.state();
    if (state.step === "empty") {
      return Promise.reject(new NoTokensError());
    }
    if (state.step === "rotating" && this.rotation !== null) {
      return this.rotation.promise;
    }
    this.rotation = Promise.withResolvers<Tokens>();
    const { promise } = this.rotation;
    this.machine.dispatch({ type: "rotateRequested" });
    return promise;
  }

  async getAccessToken(): Promise<string | null> {
    if (!this.hasUsableRefresh()) {
      return null;
    }
    if (!this.isAccessExpired()) {
      return this.tokens()?.access ?? null;
    }
    try {
      return (await this.rotate()).access;
    } catch {
      return null;
    }
  }

  private initialState(): TokenState {
    const stored = this.readStorage(localStorage.getItem(TOKENS_KEY));
    return stored === null
      ? { step: "empty", context: { tokens: null, invalidation: null } }
      : { step: "held", context: { tokens: stored } };
  }

  private readStorage(text: string | null): Tokens | null {
    if (text === null) {
      return null;
    }
    try {
      return tokensSchema.parse(JSON.parse(text));
    } catch (error) {
      this.errorHandler.handleError(error);
      return null;
    }
  }

  private onStorage(event: StorageEvent): void {
    if (event.storageArea !== localStorage || (event.key !== null && event.key !== TOKENS_KEY)) {
      return;
    }
    this.machine.dispatch({ type: "storageChanged", tokens: this.readStorage(event.newValue) });
  }

  private onHeld(state: TokenState & { step: "held" }, event: TokenEvent, previous: TokenState): void {
    if (event.type === "set" || event.type === "rotated") {
      localStorage.setItem(TOKENS_KEY, JSON.stringify(state.context.tokens));
    }
    this.armEviction();
    if (previous.step === "rotating") {
      this.settleRotation(event, state.context.tokens);
    }
  }

  private onRotating(state: TokenState & { step: "rotating" }): void {
    void this.crossTabLockService.run(REFRESH_LOCK_NAME, async () => {
      const stored = this.readStorage(localStorage.getItem(TOKENS_KEY));
      if (stored === null || stored.username !== state.context.tokens.username) {
        this.machine.dispatch({ type: "storageChanged", tokens: stored });
        return;
      }
      if (stored.refresh !== state.context.refreshBeforeLock) {
        this.machine.dispatch({ type: "reused", tokens: stored });
        return;
      }
      try {
        const rotated = await lastValueFrom(this.authService.refreshTokens(stored.refresh));
        this.machine.dispatch({ type: "rotated", tokens: { ...rotated, username: stored.username } });
      } catch (error) {
        if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized) {
          this.machine.dispatch({ type: "refreshRefused" });
        } else {
          this.machine.dispatch({ type: "rotateFailed", error });
        }
      }
    });
  }

  private onEmpty(state: TokenState & { step: "empty" }, event: TokenEvent, previous: TokenState): void {
    if (state.context.invalidation !== "accountSwitched") {
      localStorage.removeItem(TOKENS_KEY);
    }
    if (event.type === "clear" && event.revoke && previous.context.tokens !== null) {
      this.revoke(previous.context.tokens.refresh);
    }
    this.eviction?.unsubscribe();
    this.eviction = null;
    if (state.context.invalidation !== null) {
      this.invalidated.next(state.context.invalidation);
    }
    if (previous.step === "rotating") {
      this.rotation?.reject(new TokenInvalidatedError(state.context.invalidation ?? "tokensCleared"));
      this.rotation = null;
    }
  }

  private settleRotation(event: TokenEvent, tokens: Tokens): void {
    if (event.type === "rotateFailed") {
      this.rotation?.reject(event.error);
    } else {
      this.rotation?.resolve(tokens);
    }
    this.rotation = null;
  }

  private armEviction(): void {
    this.eviction?.unsubscribe();
    const expiresAt = this.refreshExpiresAt();
    this.eviction =
      expiresAt === null
        ? null
        : evictionDue(expiresAt, this.refreshExpiresAt).subscribe(() =>
            this.machine.dispatch({ type: "refreshExpired" }),
          );
  }

  private revoke(refresh: string): void {
    this.authService
      .blacklistRefreshToken(refresh)
      .pipe(
        timeout(REVOCATION_TIMEOUT_MS),
        retry(REVOCATION_RETRY_COUNT),
        catchError((error) => {
          this.errorHandler.handleError(error);
          return EMPTY;
        }),
      )
      .subscribe();
  }
}
