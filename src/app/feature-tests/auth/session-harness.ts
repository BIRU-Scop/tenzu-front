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

import { expect, vi } from "vitest";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component } from "@angular/core";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter, Router, RouterOutlet, Routes } from "@angular/router";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatInputHarness } from "@angular/material/input/testing";

import LoginComponent from "../../auth/login/login.component";
import ResetPasswordFormComponent from "../../auth/reset-password/reset-password-form/reset-password-form.component";
import { loginGuard } from "../../auth/login/login.guard";
import { unloggedOnlyGuard } from "../../auth/unlogged-only.guard";
import { verifyEmailGuard } from "../../auth/signup/verify-email.guard";
import { httpInterceptor } from "@tenzu/utils/interceptors";
import { WsService } from "@tenzu/utils/services/ws";
import { Tokens } from "@tenzu/repository/auth/auth.model";
import { makeTokens } from "@tenzu/repository/auth/auth.factories";
import { ExitReason } from "@tenzu/repository/auth/session/session-machine";
import { SessionChannelService } from "@tenzu/repository/auth/session/session-channel.service";
import { SessionLifecycleService } from "@tenzu/repository/auth/session/session-lifecycle.service";
import { TOKENS_KEY } from "@tenzu/repository/auth/token/token-repository.service";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { UserStore } from "@tenzu/repository/user/user.store";
import { makeUser } from "@tenzu/repository/user/user.factories";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { mockService } from "@tenzu/utils/testing/mocks";
import { translation } from "@tenzu/utils/testing/translation";
import { getTextByRole } from "@tenzu/utils/testing/aria-role";
import { buttonFilterByText } from "@tenzu/utils/testing/button-harness";
import { callsTo } from "@tenzu/utils/testing/http";

@Component({ template: "" })
class PageComponent {}

@Component({ imports: [RouterOutlet], template: "<router-outlet />" })
export class HostComponent {}

const routes: Routes = [
  { path: "login", component: LoginComponent, canActivate: [unloggedOnlyGuard] },
  { path: "signup/verify/:token", component: PageComponent, canActivate: [verifyEmailGuard] },
  { path: "reset-password/:token", component: ResetPasswordFormComponent },
  { path: "workspace/:workspaceId", component: PageComponent, canActivate: [loginGuard] },
  { path: "workspace/:workspaceId/project/:projectId", component: PageComponent, canActivate: [loginGuard] },
  { path: "", component: PageComponent },
];

export type SessionHarness = {
  fixture: ComponentFixture<HostComponent>;
  router: Router;
  httpMock: HttpTestingController;
  apiUrl: string;
  wsServiceMock: ReturnType<typeof mockService<WsService>>;
  submitLoginForm(username: string): Promise<Tokens>;
  alertText(): string;
  anotherTab: { announceEnded(reason: ExitReason): void; writeTokens(tokens: Tokens): void; clearTokens(): void };
  navigatedTo(url: string): Promise<void>;
};

function storageEvent(newValue: string | null): StorageEvent {
  return new StorageEvent("storage", { key: TOKENS_KEY, newValue, storageArea: localStorage });
}

export function loggedInSession({
  tokens = makeTokens({ username: "1user" }),
}: { tokens?: Tokens } = {}): Promise<SessionHarness> {
  return sessionHarness({ tokens, url: "/workspace/w1" });
}

export async function sessionHarness({ tokens, url }: { tokens?: Tokens; url: string }): Promise<SessionHarness> {
  localStorage.clear();
  sessionStorage.clear();
  if (tokens) {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  }
  const wsServiceMock = mockService(WsService);
  TestBed.configureTestingModule({
    providers: [
      testingProviders,
      provideRouter(routes),
      provideHttpClient(withInterceptors([httpInterceptor])),
      provideHttpClientTesting(),
      { provide: WsService, useValue: wsServiceMock },
    ],
  });
  const fixture = TestBed.createComponent(HostComponent);
  const router = TestBed.inject(Router);
  const httpMock = TestBed.inject(HttpTestingController);
  const apiUrl = TestBed.inject(ConfigAppService).apiUrl();
  TestBed.inject(SessionLifecycleService);
  TestBed.inject(UserStore);
  const anotherTabChannel = TestBed.runInInjectionContext(() => new SessionChannelService());
  await router.navigateByUrl(url);
  await fixture.whenStable();

  const navigatedTo = async (url: string): Promise<void> => {
    await vi.waitFor(() => expect(router.url).toBe(url));
    await fixture.whenStable();
  };

  return {
    fixture,
    router,
    httpMock,
    apiUrl,
    wsServiceMock,
    async submitLoginForm(username: string): Promise<Tokens> {
      const loader = TestbedHarnessEnvironment.loader(fixture);
      await (
        await loader.getHarness(MatInputHarness.with({ selector: '[autocomplete="username"]' }))
      ).setValue(username);
      await (await loader.getHarness(MatInputHarness.with({ selector: '[type="password"]' }))).setValue("123123");
      await (await loader.getHarness(buttonFilterByText(translation("auth.login.action")))).click();
      const tokens = makeTokens({ username });
      (await callsTo(httpMock, `${apiUrl}/auth/token`))[0].flush(tokens);
      (await callsTo(httpMock, `${apiUrl}/users/me`))[0].flush({ data: makeUser({ username }) });
      await fixture.whenStable();
      return tokens;
    },
    alertText: () => getTextByRole(fixture.nativeElement, "alert"),
    anotherTab: {
      announceEnded: (reason) => anotherTabChannel.announceEnded(reason),
      writeTokens: (tokens) => {
        localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
        window.dispatchEvent(storageEvent(JSON.stringify(tokens)));
      },
      clearTokens: () => {
        localStorage.removeItem(TOKENS_KEY);
        window.dispatchEvent(storageEvent(null));
      },
    },
    navigatedTo,
  };
}
