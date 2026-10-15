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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { ErrorHandler } from "@angular/core";
import { HttpErrorResponse, HttpStatusCode } from "@angular/common/http";
import { NEVER, of, throwError } from "rxjs";
import { ZodError } from "zod/v4";

import { NoTokensError, REFRESH_LOCK_NAME, TOKENS_KEY, TokenRepositoryService } from "./token-repository.service";
import { TokenInvalidation } from "./token-machine";
import { AuthService } from "../auth.service";
import { makeTokens } from "../auth.factories";
import { Tokens } from "../auth.model";
import { CrossTabLockService } from "@tenzu/utils/services/cross-tab-lock/cross-tab-lock.service";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";

const HOUR_MS = 60 * 60 * 1000;

describe("TokenRepositoryService", () => {
  const authServiceMock = { refreshTokens: vi.fn(), blacklistRefreshToken: vi.fn() };
  const crossTabLockServiceMock = { run: vi.fn(<T>(name: string, work: () => Promise<T>) => work()) };
  const errorHandlerMock = { handleError: vi.fn() };
  let tokens: Tokens;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
    crossTabLockServiceMock.run.mockImplementation((name, work) => work());
    authServiceMock.blacklistRefreshToken.mockReturnValue(of(undefined));
    localStorage.clear();
    tokens = makeTokens({ username: "alice" });
    TestBed.configureTestingModule({
      providers: [
        testingProviders,
        { provide: AuthService, useValue: authServiceMock },
        { provide: CrossTabLockService, useValue: crossTabLockServiceMock },
        { provide: ErrorHandler, useValue: errorHandlerMock },
      ],
    });
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  const storedTokens = (): Tokens | null => {
    const text = localStorage.getItem(TOKENS_KEY);
    return text === null ? null : (JSON.parse(text) as Tokens);
  };

  const invalidations = (tokenRepositoryService: TokenRepositoryService): TokenInvalidation[] => {
    const emitted: TokenInvalidation[] = [];
    tokenRepositoryService.invalidated$.subscribe((invalidation) => emitted.push(invalidation));
    return emitted;
  };

  const storageEvent = (newValue: string | null, key: string | null = TOKENS_KEY): void => {
    window.dispatchEvent(new StorageEvent("storage", { key, newValue, storageArea: localStorage }));
  };

  const heldStore = (): TokenRepositoryService => {
    const tokenRepositoryService = TestBed.inject(TokenRepositoryService);
    tokenRepositoryService.set(tokens);
    return tokenRepositoryService;
  };

  const unauthorized = new HttpErrorResponse({ status: HttpStatusCode.Unauthorized });
  const serverError = new HttpErrorResponse({ status: HttpStatusCode.InternalServerError });

  describe("boot", () => {
    it("TokenRepositoryService starts held with the stored tokens when TOKENS_KEY is present", () => {
      localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));

      const tokenRepositoryService = TestBed.inject(TokenRepositoryService);

      expect(tokenRepositoryService.step()).toBe("held");
      expect(tokenRepositoryService.tokens()).toEqual(tokens);
    });

    it("TokenRepositoryService starts empty when TOKENS_KEY is absent", () => {
      expect(TestBed.inject(TokenRepositoryService).step()).toBe("empty");
    });

    it("TokenRepositoryService starts empty when the stored value does not match tokensSchema", () => {
      localStorage.setItem(TOKENS_KEY, JSON.stringify({ access: "access-token" }));

      expect(TestBed.inject(TokenRepositoryService).step()).toBe("empty");
    });

    it("TokenRepositoryService calls errorHandler.handleError with the ZodError when the stored value does not match tokensSchema", () => {
      localStorage.setItem(TOKENS_KEY, JSON.stringify({ access: "access-token" }));

      TestBed.inject(TokenRepositoryService);

      expect(errorHandlerMock.handleError).toHaveBeenCalledOnce();
      expect(errorHandlerMock.handleError.mock.calls[0][0]).toBeInstanceOf(ZodError);
    });
  });

  describe("set, reaction held", () => {
    it("set writes the tokens under TOKENS_KEY", () => {
      heldStore();

      expect(storedTokens()).toEqual(tokens);
    });

    it("set publishes refreshExpired on invalidated$ when the clock reaches the exp of the refresh", () => {
      const emitted = invalidations(heldStore());

      vi.advanceTimersByTime(24 * HOUR_MS);

      expect(emitted).toEqual(["refreshExpired"]);
    });

    it("set does not publish on invalidated$ before the exp of the refresh", () => {
      const emitted = invalidations(heldStore());

      vi.advanceTimersByTime(23 * HOUR_MS);

      expect(emitted).toEqual([]);
    });

    it("set removes TOKENS_KEY when the clock reaches the exp of the refresh", () => {
      heldStore();

      vi.advanceTimersByTime(24 * HOUR_MS);

      expect(storedTokens()).toBeNull();
    });
  });

  describe("rotate, reaction rotating", () => {
    const rotated = { access: "access-token-2", refresh: "refresh-token-2" };

    it("rotate calls crossTabLockService.run with REFRESH_LOCK_NAME", async () => {
      authServiceMock.refreshTokens.mockReturnValue(of(rotated));

      await heldStore().rotate();

      expect(crossTabLockServiceMock.run).toHaveBeenCalledExactlyOnceWith(REFRESH_LOCK_NAME, expect.any(Function));
    });

    it("rotate calls authService.refreshTokens with the refresh when the stored refresh is unchanged under the lock", async () => {
      authServiceMock.refreshTokens.mockReturnValue(of(rotated));

      await heldStore().rotate();

      expect(authServiceMock.refreshTokens).toHaveBeenCalledExactlyOnceWith(tokens.refresh);
    });

    it("rotate resolves with the rotated tokens and the current username", async () => {
      authServiceMock.refreshTokens.mockReturnValue(of(rotated));

      await expect(heldStore().rotate()).resolves.toEqual({ ...rotated, username: "alice" });
    });

    it("rotate writes the rotated tokens under TOKENS_KEY", async () => {
      authServiceMock.refreshTokens.mockReturnValue(of(rotated));

      await heldStore().rotate();

      expect(storedTokens()).toEqual({ ...rotated, username: "alice" });
    });

    it("rotate resolves with the stored tokens when the stored refresh changed under the lock", async () => {
      const tokenRepositoryService = heldStore();
      const rotatedElsewhere = makeTokens({ username: "alice", refresh: "refresh-token-elsewhere" });
      localStorage.setItem(TOKENS_KEY, JSON.stringify(rotatedElsewhere));

      await expect(tokenRepositoryService.rotate()).resolves.toEqual(rotatedElsewhere);
    });

    it("rotate does not call authService.refreshTokens when the stored refresh changed under the lock", async () => {
      const tokenRepositoryService = heldStore();
      localStorage.setItem(
        TOKENS_KEY,
        JSON.stringify(makeTokens({ username: "alice", refresh: "refresh-token-elsewhere" })),
      );

      await tokenRepositoryService.rotate();

      expect(authServiceMock.refreshTokens).not.toHaveBeenCalled();
    });

    it("rotate rejects with tokensCleared when TOKENS_KEY is absent under the lock", async () => {
      const tokenRepositoryService = heldStore();
      localStorage.removeItem(TOKENS_KEY);

      await expect(tokenRepositoryService.rotate()).rejects.toMatchObject({ invalidation: "tokensCleared" });
    });

    it("rotate publishes tokensCleared on invalidated$ when TOKENS_KEY is absent under the lock", async () => {
      const tokenRepositoryService = heldStore();
      const emitted = invalidations(tokenRepositoryService);
      localStorage.removeItem(TOKENS_KEY);

      await tokenRepositoryService.rotate().catch(() => undefined);

      expect(emitted).toEqual(["tokensCleared"]);
    });

    it("rotate rejects with accountSwitched when the stored username differs under the lock", async () => {
      const tokenRepositoryService = heldStore();
      localStorage.setItem(TOKENS_KEY, JSON.stringify(makeTokens({ username: "bob" })));

      await expect(tokenRepositoryService.rotate()).rejects.toMatchObject({ invalidation: "accountSwitched" });
    });

    it("rotate publishes accountSwitched on invalidated$ when the stored username differs under the lock", async () => {
      const tokenRepositoryService = heldStore();
      const emitted = invalidations(tokenRepositoryService);
      localStorage.setItem(TOKENS_KEY, JSON.stringify(makeTokens({ username: "bob" })));

      await tokenRepositoryService.rotate().catch(() => undefined);

      expect(emitted).toEqual(["accountSwitched"]);
    });

    it("rotate rejects with refreshRefused when authService.refreshTokens fails with Unauthorized", async () => {
      authServiceMock.refreshTokens.mockReturnValue(throwError(() => unauthorized));

      await expect(heldStore().rotate()).rejects.toMatchObject({ invalidation: "refreshRefused" });
    });

    it("rotate publishes refreshRefused on invalidated$ when authService.refreshTokens fails with Unauthorized", async () => {
      authServiceMock.refreshTokens.mockReturnValue(throwError(() => unauthorized));
      const tokenRepositoryService = heldStore();
      const emitted = invalidations(tokenRepositoryService);

      await tokenRepositoryService.rotate().catch(() => undefined);

      expect(emitted).toEqual(["refreshRefused"]);
    });

    it("rotate rejects with the error when authService.refreshTokens fails with InternalServerError", async () => {
      authServiceMock.refreshTokens.mockReturnValue(throwError(() => serverError));

      await expect(heldStore().rotate()).rejects.toBe(serverError);
    });

    it("rotate sets step to held when authService.refreshTokens fails with InternalServerError", async () => {
      authServiceMock.refreshTokens.mockReturnValue(throwError(() => serverError));
      const tokenRepositoryService = heldStore();

      await tokenRepositoryService.rotate().catch(() => undefined);

      expect(tokenRepositoryService.step()).toBe("held");
    });

    it("rotate rejects with the ZodError when the response does not match rotatedTokensSchema", async () => {
      const zodError = new ZodError([]);
      authServiceMock.refreshTokens.mockReturnValue(throwError(() => zodError));

      await expect(heldStore().rotate()).rejects.toBe(zodError);
    });

    it("rotate sets step to held when the response does not match rotatedTokensSchema", async () => {
      authServiceMock.refreshTokens.mockReturnValue(throwError(() => new ZodError([])));
      const tokenRepositoryService = heldStore();

      await tokenRepositoryService.rotate().catch(() => undefined);

      expect(tokenRepositoryService.step()).toBe("held");
    });

    it("rotate returns the same promise while rotating", async () => {
      authServiceMock.refreshTokens.mockReturnValue(of(rotated));
      const tokenRepositoryService = heldStore();

      const first = tokenRepositoryService.rotate();
      const second = tokenRepositoryService.rotate();
      await first;

      expect(second).toBe(first);
    });

    it("rotate calls authService.refreshTokens once when called twice while rotating", async () => {
      authServiceMock.refreshTokens.mockReturnValue(of(rotated));
      const tokenRepositoryService = heldStore();

      await Promise.all([tokenRepositoryService.rotate(), tokenRepositoryService.rotate()]);

      expect(authServiceMock.refreshTokens).toHaveBeenCalledOnce();
    });

    it("rotate rejects with NoTokensError from empty", async () => {
      await expect(TestBed.inject(TokenRepositoryService).rotate()).rejects.toBeInstanceOf(NoTokensError);
    });

    it("rotate does not publish on invalidated$ from empty", async () => {
      const tokenRepositoryService = TestBed.inject(TokenRepositoryService);
      const emitted = invalidations(tokenRepositoryService);

      await tokenRepositoryService.rotate().catch(() => undefined);

      expect(emitted).toEqual([]);
    });
  });

  describe("clear, reaction empty", () => {
    it("clear removes TOKENS_KEY", () => {
      heldStore().clear();

      expect(storedTokens()).toBeNull();
    });

    it("storage event with tokens of another username leaves TOKENS_KEY untouched", () => {
      heldStore();
      const otherAccount = makeTokens({ username: "bob" });
      localStorage.setItem(TOKENS_KEY, JSON.stringify(otherAccount));

      storageEvent(JSON.stringify(otherAccount));

      expect(storedTokens()).toEqual(otherAccount);
    });

    it("clear calls authService.blacklistRefreshToken with the refresh of the cleared tokens when revoke is true", () => {
      heldStore().clear({ revoke: true });

      expect(authServiceMock.blacklistRefreshToken).toHaveBeenCalledExactlyOnceWith(tokens.refresh);
    });

    it("clear does not call authService.blacklistRefreshToken when revoke is false", () => {
      heldStore().clear({ revoke: false });

      expect(authServiceMock.blacklistRefreshToken).not.toHaveBeenCalled();
    });

    it("clear removes TOKENS_KEY while authService.blacklistRefreshToken is pending", () => {
      authServiceMock.blacklistRefreshToken.mockReturnValue(NEVER);

      heldStore().clear({ revoke: true });

      expect(storedTokens()).toBeNull();
    });

    it("clear calls errorHandler.handleError when authService.blacklistRefreshToken fails on every retry", () => {
      authServiceMock.blacklistRefreshToken.mockReturnValue(throwError(() => serverError));

      heldStore().clear({ revoke: true });

      expect(errorHandlerMock.handleError).toHaveBeenCalledExactlyOnceWith(serverError);
    });

    it("clear does not publish on invalidated$", () => {
      const tokenRepositoryService = heldStore();
      const emitted = invalidations(tokenRepositoryService);

      tokenRepositoryService.clear();

      expect(emitted).toEqual([]);
    });

    it("clear does not publish refreshExpired on invalidated$ when the clock reaches the exp of the cleared refresh", () => {
      const tokenRepositoryService = heldStore();
      const emitted = invalidations(tokenRepositoryService);

      tokenRepositoryService.clear();
      vi.advanceTimersByTime(24 * HOUR_MS);

      expect(emitted).toEqual([]);
    });
  });

  describe("storage event", () => {
    it("storage event with tokens of the same username sets tokens to them", () => {
      const tokenRepositoryService = heldStore();
      const rotatedElsewhere = makeTokens({ username: "alice", refresh: "refresh-token-elsewhere" });

      storageEvent(JSON.stringify(rotatedElsewhere));

      expect(tokenRepositoryService.tokens()).toEqual(rotatedElsewhere);
    });

    it("storage event with tokens of the same username does not write TOKENS_KEY", () => {
      heldStore();
      const setItem = vi.spyOn(Storage.prototype, "setItem");

      storageEvent(JSON.stringify(makeTokens({ username: "alice", refresh: "refresh-token-elsewhere" })));

      expect(setItem).not.toHaveBeenCalled();
    });

    it("storage event with newValue null publishes tokensCleared on invalidated$", () => {
      const emitted = invalidations(heldStore());

      storageEvent(null);

      expect(emitted).toEqual(["tokensCleared"]);
    });

    it("storage event with key null publishes tokensCleared on invalidated$", () => {
      const emitted = invalidations(heldStore());

      storageEvent(null, null);

      expect(emitted).toEqual(["tokensCleared"]);
    });

    it("storage event with tokens of another username publishes accountSwitched on invalidated$", () => {
      const emitted = invalidations(heldStore());

      storageEvent(JSON.stringify(makeTokens({ username: "bob" })));

      expect(emitted).toEqual(["accountSwitched"]);
    });

    it("storage event on another key leaves tokens unchanged", () => {
      const tokenRepositoryService = heldStore();

      storageEvent(null, "tenzu:session:next");

      expect(tokenRepositoryService.tokens()).toEqual(tokens);
    });

    it("storage event on sessionStorage leaves tokens unchanged", () => {
      const tokenRepositoryService = heldStore();

      window.dispatchEvent(
        new StorageEvent("storage", { key: TOKENS_KEY, newValue: null, storageArea: sessionStorage }),
      );

      expect(tokenRepositoryService.tokens()).toEqual(tokens);
    });

    it("storage event with a later refresh exp does not publish refreshExpired on invalidated$ when the clock reaches the former exp", () => {
      const emitted = invalidations(heldStore());
      storageEvent(JSON.stringify(makeTokens({ username: "alice", refreshExp: new Date(Date.now() + 48 * HOUR_MS) })));

      vi.advanceTimersByTime(24 * HOUR_MS);

      expect(emitted).toEqual([]);
    });

    it("storage event with a later refresh exp publishes refreshExpired on invalidated$ when the clock reaches the later exp", () => {
      const emitted = invalidations(heldStore());
      storageEvent(JSON.stringify(makeTokens({ username: "alice", refreshExp: new Date(Date.now() + 48 * HOUR_MS) })));

      vi.advanceTimersByTime(48 * HOUR_MS);

      expect(emitted).toEqual(["refreshExpired"]);
    });

    it("storage event sets tokens from newValue when localStorage already holds another value", () => {
      const tokenRepositoryService = heldStore();
      const fromEvent = makeTokens({ username: "alice", refresh: "refresh-token-event" });
      localStorage.setItem(
        TOKENS_KEY,
        JSON.stringify(makeTokens({ username: "alice", refresh: "refresh-token-later" })),
      );

      storageEvent(JSON.stringify(fromEvent));

      expect(tokenRepositoryService.tokens()).toEqual(fromEvent);
    });
  });

  describe("validity signals", () => {
    it("hasUsableRefresh is true when the refresh exp is in the future", () => {
      expect(heldStore().hasUsableRefresh()).toBe(true);
    });

    it("hasUsableRefresh is false when the refresh exp is in the past", () => {
      const tokenRepositoryService = TestBed.inject(TokenRepositoryService);
      tokenRepositoryService.set(makeTokens({ refreshExp: new Date(Date.now() - HOUR_MS) }));

      expect(tokenRepositoryService.hasUsableRefresh()).toBe(false);
    });

    it("hasUsableRefresh is false when step is empty", () => {
      expect(TestBed.inject(TokenRepositoryService).hasUsableRefresh()).toBe(false);
    });

    it("isAccessExpired is false when the access exp is in the future", () => {
      expect(heldStore().isAccessExpired()).toBe(false);
    });

    it("isAccessExpired is true when the access exp is in the past", () => {
      const tokenRepositoryService = TestBed.inject(TokenRepositoryService);
      tokenRepositoryService.set(makeTokens({ accessExp: new Date(Date.now() - HOUR_MS) }));

      expect(tokenRepositoryService.isAccessExpired()).toBe(true);
    });

    it("isAccessExpired is true when step is empty", () => {
      expect(TestBed.inject(TokenRepositoryService).isAccessExpired()).toBe(true);
    });

    it("refreshExpiresAt is the exp of the refresh as a Date", () => {
      const refreshExp = new Date(Math.floor((Date.now() + 24 * HOUR_MS) / 1000) * 1000);
      const tokenRepositoryService = TestBed.inject(TokenRepositoryService);
      tokenRepositoryService.set(makeTokens({ refreshExp }));

      expect(tokenRepositoryService.refreshExpiresAt()).toEqual(refreshExp);
    });

    it("refreshExpiresAt is null when step is empty", () => {
      expect(TestBed.inject(TokenRepositoryService).refreshExpiresAt()).toBeNull();
    });
  });
});
