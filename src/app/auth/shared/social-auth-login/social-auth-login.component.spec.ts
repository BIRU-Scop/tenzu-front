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
import { inputBinding, signal } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { BehaviorSubject } from "rxjs";

import SocialAuthLoginComponent from "./social-auth-login.component";
import { RememberedNextStore } from "@tenzu/repository/auth/stores/remembered-next.store";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";

describe("SocialAuthLoginComponent", () => {
  let fixture: ComponentFixture<SocialAuthLoginComponent>;
  const rememberedNextStoreMock = { remember: vi.fn() };
  let queryParams: BehaviorSubject<Params>;

  const withQueryParams = (params: Params): void => {
    queryParams.next(params);
  };

  beforeEach(() => {
    rememberedNextStoreMock.remember.mockReset();
    queryParams = new BehaviorSubject<Params>({});
    TestBed.configureTestingModule({
      providers: [
        testingProviders,
        { provide: RememberedNextStore, useValue: rememberedNextStoreMock },
        { provide: ActivatedRoute, useValue: { queryParams } },
      ],
    });
    fixture = TestBed.createComponent(SocialAuthLoginComponent, { bindings: [inputBinding("signup", signal(false))] });
  });

  it("rememberNext calls rememberedNextStore.remember with next and null when the url carries next", () => {
    withQueryParams({ next: "/workspace/w1" });

    fixture.componentInstance.rememberNext();

    expect(rememberedNextStoreMock.remember).toHaveBeenCalledExactlyOnceWith("/workspace/w1", null);
  });

  it("rememberNext does not call rememberedNextStore.remember when the url carries no next", () => {
    fixture.componentInstance.rememberNext();

    expect(rememberedNextStoreMock.remember).not.toHaveBeenCalled();
  });

  it("forwardedParams returns the query params without next", () => {
    withQueryParams({ next: "/workspace/w1", fromSignup: "true" });

    expect(fixture.componentInstance.forwardedParams()).toEqual({ fromSignup: "true" });
  });
});
