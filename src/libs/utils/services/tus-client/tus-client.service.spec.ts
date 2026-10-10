/*
 * Copyright (C) 2026 BIRU
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
import { TestBed } from "@angular/core/testing";
import { HttpStatusCode } from "@angular/common/http";
import type * as tus from "tus-js-client";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { signal } from "@angular/core";
import { UserStore } from "@tenzu/repository/user/user.store";
import { makeUser } from "@tenzu/repository/user/user.factories";
import {
  InvalidUploadExpiresError,
  TUS_TOKEN_GETTER,
  TUS_UPLOAD_CLASS,
  TusClientCreateOptions,
  TusClientService,
} from "./tus-client.service";
import { makeTusError, makeTusRequest, makeTusResponse } from "./tus-client.factories";
import { MEGABYTE } from "@tenzu/pipes/humanize-file-size";

class TusUploadMock {
  static instances: TusUploadMock[] = [];
  readonly start = vi.fn();
  readonly abort = vi.fn(() => Promise.resolve());

  constructor(
    readonly file: File,
    readonly options: tus.UploadOptions,
  ) {
    TusUploadMock.instances.push(this);
  }
}

function makeOptions(overrides: Partial<TusClientCreateOptions> = {}): TusClientCreateOptions {
  return {
    userId: "user-1",
    endpoint: "http://localhost/api/v1/workspaces/workspace-1/projects/importations",
    onUrl: vi.fn(),
    onProgress: vi.fn(),
    onRetry: vi.fn(),
    onSuccess: vi.fn(),
    onError: vi.fn(),
    onForbidden: vi.fn(),
    ...overrides,
  };
}

describe(TusClientService.name, () => {
  let tusClientService: TusClientService;
  const tokenGetterMock = vi.fn<() => string | null>();
  const userStoreMock = { myUser: signal(makeUser()) };
  const file = new File(["{}"], "backup.json", { type: "application/json" });

  beforeEach(() => {
    TusUploadMock.instances = [];
    tokenGetterMock.mockReset();
    TestBed.configureTestingModule({
      providers: [
        ...testingProviders,
        { provide: TUS_UPLOAD_CLASS, useValue: TusUploadMock },
        { provide: TUS_TOKEN_GETTER, useValue: tokenGetterMock },
        { provide: UserStore, useValue: userStoreMock },
      ],
    });
    tusClientService = TestBed.inject(TusClientService);
  });

  it("create sets uploadDataDuringCreation to false", () => {
    tusClientService.create(file, makeOptions());

    expect(TusUploadMock.instances[0].options.uploadDataDuringCreation).toBe(false);
  });

  it("create sets storeFingerprintForResuming to false", () => {
    tusClientService.create(file, makeOptions());

    expect(TusUploadMock.instances[0].options.storeFingerprintForResuming).toBe(false);
  });

  it("create sets chunkSize to 50 MB", () => {
    tusClientService.create(file, makeOptions());

    expect(TusUploadMock.instances[0].options.chunkSize).toBe(50 * MEGABYTE);
  });

  it("create passes metadata to the upload", () => {
    const metadata = { filename: "backup.json", filetype: "application/json", originType: "taiga" };

    tusClientService.create(file, makeOptions({ metadata }));

    expect(TusUploadMock.instances[0].options.metadata).toEqual(metadata);
  });

  it("create sets uploadUrl from the tus upload id", () => {
    const apiUrl = TestBed.inject(ConfigAppService).apiUrl();

    tusClientService.create(file, makeOptions({ endpoint: undefined, tusUploadId: "abc" }));

    expect(TusUploadMock.instances[0].options.uploadUrl).toBe(`${apiUrl}/upload/abc`);
  });

  it("onBeforeRequest sets Authorization from the current token", async () => {
    tokenGetterMock.mockReturnValueOnce("a").mockReturnValueOnce("b");
    userStoreMock.myUser.set(makeUser({ id: "user-1" }));
    tusClientService.create(file, makeOptions({ userId: "user-1" }));
    const { onBeforeRequest } = TusUploadMock.instances[0].options;
    const firstRequest = makeTusRequest(`${TestBed.inject(ConfigAppService).apiUrl()}/upload/abc`);
    const secondRequest = makeTusRequest(`${TestBed.inject(ConfigAppService).apiUrl()}/upload/abc`);

    await onBeforeRequest?.(firstRequest);
    await onBeforeRequest?.(secondRequest);

    expect(firstRequest.setHeader).toHaveBeenCalledWith("Authorization", "Bearer a");
    expect(secondRequest.setHeader).toHaveBeenCalledWith("Authorization", "Bearer b");
  });

  it("onBeforeRequest throws on a foreign origin without setting Authorization", async () => {
    tokenGetterMock.mockReturnValue("a");
    userStoreMock.myUser.set(makeUser({ id: "user-1" }));
    tusClientService.create(file, makeOptions({ userId: "user-1" }));
    const { onBeforeRequest } = TusUploadMock.instances[0].options;
    const request = makeTusRequest("https://attacker.example/x");

    await expect(onBeforeRequest?.(request)).rejects.toThrow();

    expect(request.setHeader).not.toHaveBeenCalled();
  });

  it("onBeforeRequest throws for another user's upload without setting Authorization", async () => {
    tokenGetterMock.mockReturnValue("a");
    userStoreMock.myUser.set(makeUser({ id: "user-2" }));
    tusClientService.create(file, makeOptions({ userId: "user-1" }));
    const { onBeforeRequest } = TusUploadMock.instances[0].options;
    const request = makeTusRequest(`${TestBed.inject(ConfigAppService).apiUrl()}/upload/abc`);

    await expect(onBeforeRequest?.(request)).rejects.toThrow();

    expect(request.setHeader).not.toHaveBeenCalled();
  });

  it("onBeforeRequest calls onForbidden for another user's upload", async () => {
    userStoreMock.myUser.set(makeUser({ id: "user-2" }));
    const options = makeOptions({ userId: "user-1" });
    tusClientService.create(file, options);
    const { onBeforeRequest } = TusUploadMock.instances[0].options;
    const request = makeTusRequest(`${TestBed.inject(ConfigAppService).apiUrl()}/upload/abc`);

    await expect(onBeforeRequest?.(request)).rejects.toThrow();

    expect(options.onForbidden).toHaveBeenCalledOnce();
  });

  const shouldRetry = (status: number | null): boolean => {
    const { onShouldRetry } = TusUploadMock.instances[0].options;
    return typeof onShouldRetry === "function"
      ? onShouldRetry(makeTusError(status), 0, TusUploadMock.instances[0].options)
      : (onShouldRetry ?? false);
  };

  it.each([
    { response: "network error", status: null, retry: true },
    { response: "503", status: HttpStatusCode.ServiceUnavailable, retry: true },
    { response: "401", status: HttpStatusCode.Unauthorized, retry: false },
    { response: "404", status: HttpStatusCode.NotFound, retry: false },
    { response: "422", status: HttpStatusCode.UnprocessableEntity, retry: false },
  ])("onShouldRetry returns $retry on $response", ({ status, retry }) => {
    tusClientService.create(file, makeOptions());

    expect(shouldRetry(status)).toBe(retry);
  });

  it("onUploadUrlAvailable and onAfterResponse call onUrl with the id and the expiry", async () => {
    const options = makeOptions();
    tusClientService.create(file, options);
    const { onAfterResponse, onUploadUrlAvailable } = TusUploadMock.instances[0].options;
    const creationResponse = makeTusResponse({
      Location: "/api/v1/upload/abc",
      "Upload-Expires": "Sun, 05 Oct 2026 14:30:00 GMT",
    });

    await onAfterResponse?.(makeTusRequest(options.endpoint ?? "", "POST"), creationResponse);
    onUploadUrlAvailable?.();

    expect(options.onUrl).toHaveBeenCalledExactlyOnceWith("abc", "2026-10-05T14:30:00.000Z");
  });

  it("onAfterResponse throws InvalidUploadExpiresError without Upload-Expires", () => {
    const options = makeOptions();
    tusClientService.create(file, options);
    const { onAfterResponse } = TusUploadMock.instances[0].options;
    const creationResponse = makeTusResponse({ Location: "/api/v1/upload/abc" });

    expect(() => onAfterResponse?.(makeTusRequest(options.endpoint ?? "", "POST"), creationResponse)).toThrow(
      InvalidUploadExpiresError,
    );

    expect(options.onUrl).not.toHaveBeenCalled();
  });

  it("onProgress is forwarded with the bytes sent", () => {
    const options = makeOptions();
    tusClientService.create(file, options);

    TusUploadMock.instances[0].options.onProgress?.(42, 200);

    expect(options.onProgress).toHaveBeenCalledExactlyOnceWith(42);
  });

  it.each([
    { response: "503", status: HttpStatusCode.ServiceUnavailable, calls: 1 },
    { response: "404", status: HttpStatusCode.NotFound, calls: 0 },
  ])("onShouldRetry calls onRetry $calls time on $response", ({ status, calls }) => {
    const options = makeOptions();
    tusClientService.create(file, options);

    shouldRetry(status);

    expect(options.onRetry).toHaveBeenCalledTimes(calls);
  });

  it("onSuccess is forwarded", () => {
    const options = makeOptions();
    tusClientService.create(file, options);

    TusUploadMock.instances[0].options.onSuccess?.({ lastResponse: makeTusResponse({}, 204) });

    expect(options.onSuccess).toHaveBeenCalledOnce();
  });

  it("onError is forwarded with the error", () => {
    const options = makeOptions();
    tusClientService.create(file, options);
    const error = makeTusError(HttpStatusCode.ServiceUnavailable);

    TusUploadMock.instances[0].options.onError?.(error);

    expect(options.onError).toHaveBeenCalledExactlyOnceWith(error);
  });

  it("pause aborts without terminating", async () => {
    const tusClientUpload = tusClientService.create(file, makeOptions());
    tusClientUpload.start();

    await tusClientUpload.pause();

    expect(TusUploadMock.instances[0].abort).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("cancel aborts and terminates", async () => {
    const tusClientUpload = tusClientService.create(file, makeOptions());
    tusClientUpload.start();

    await tusClientUpload.cancel();

    expect(TusUploadMock.instances[0].abort).toHaveBeenCalledExactlyOnceWith(true);
  });

  it("start after pause starts the same tus.Upload instance", async () => {
    const tusClientUpload = tusClientService.create(file, makeOptions());
    tusClientUpload.start();
    await tusClientUpload.pause();

    tusClientUpload.start();

    expect(TusUploadMock.instances).toHaveLength(1);
    expect(TusUploadMock.instances[0].start).toHaveBeenCalledTimes(2);
  });
});
