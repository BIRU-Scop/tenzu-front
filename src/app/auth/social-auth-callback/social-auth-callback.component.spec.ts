/*
 * Copyright (C) 2024-2026 BIRU
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

import { beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import SocialAuthCallbackComponent from "./social-auth-callback.component";
import { SessionLifecycleService } from "@tenzu/repository/auth/session/session-lifecycle.service";
import { RememberedNextStore } from "@tenzu/repository/auth/stores/remembered-next.store";
import { ProviderCallback } from "@tenzu/repository/auth/auth.model";
import { makeTokens } from "@tenzu/repository/auth/auth.factories";
import { NotificationService } from "@tenzu/utils/services/notification";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { mockService } from "@tenzu/utils/testing/mocks";

describe("SocialAuthCallbackComponent", () => {
  let fixture: ComponentFixture<SocialAuthCallbackComponent>;
  const sessionLifecycleServiceMock = { sessionStarted: vi.fn() };
  const rememberedNextStoreMock = { take: vi.fn<(username: string) => string | null>(), remember: vi.fn() };
  const callback: ProviderCallback = { ...makeTokens({ username: "1user" }), fromSignup: false, next: "/workspace/w2" };

  beforeEach(() => {
    vi.resetAllMocks();
    rememberedNextStoreMock.take.mockReturnValue(null);
    TestBed.configureTestingModule({
      providers: [
        testingProviders,
        { provide: SessionLifecycleService, useValue: sessionLifecycleServiceMock },
        { provide: RememberedNextStore, useValue: rememberedNextStoreMock },
        { provide: NotificationService, useValue: mockService(NotificationService) },
      ],
    });
    fixture = TestBed.createComponent(SocialAuthCallbackComponent);
  });

  it("tryAuthenticate calls sessionLifecycleService.sessionStarted with the tokens and the next returned by take when take returns a next", () => {
    rememberedNextStoreMock.take.mockReturnValue("/workspace/w1");

    fixture.componentInstance.tryAuthenticate(callback);

    expect(sessionLifecycleServiceMock.sessionStarted).toHaveBeenCalledExactlyOnceWith(callback, "/workspace/w1");
  });

  it("tryAuthenticate calls sessionLifecycleService.sessionStarted with the tokens and callback.next when take returns null and callback.next is usable", () => {
    fixture.componentInstance.tryAuthenticate(callback);

    expect(sessionLifecycleServiceMock.sessionStarted).toHaveBeenCalledExactlyOnceWith(callback, "/workspace/w2");
  });

  it("tryAuthenticate calls sessionLifecycleService.sessionStarted with the tokens and null when take returns null and callback.next is not usable", () => {
    const forged = { ...callback, next: "//evil.example.com" };

    fixture.componentInstance.tryAuthenticate(forged);

    expect(sessionLifecycleServiceMock.sessionStarted).toHaveBeenCalledExactlyOnceWith(forged, null);
  });

  it("tryAuthenticate returns false without access or refresh", () => {
    expect(fixture.componentInstance.tryAuthenticate({ fromSignup: false, error: "unverified" })).toBe(false);
  });
});
