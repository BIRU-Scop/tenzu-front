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

import { inject, InjectionToken, Service } from "@angular/core";
import { HttpStatusCode } from "@angular/common/http";
import * as tus from "tus-js-client";
import { tokenGetter } from "@tenzu/utils/functions/token";
import { MEGABYTE } from "@tenzu/pipes/humanize-file-size";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { UserStore } from "@tenzu/repository/user/user.store";

// The backend processes an upload chunk by chunk.
const CHUNK_SIZE = 50 * MEGABYTE;

export const TUS_UPLOAD_CLASS = new InjectionToken<typeof tus.Upload>("TUS_UPLOAD_CLASS", {
  providedIn: "root",
  factory: () => tus.Upload,
});

export const TUS_TOKEN_GETTER = new InjectionToken<() => string | null>("TUS_TOKEN_GETTER", {
  providedIn: "root",
  factory: () => tokenGetter,
});

export type TusClientCreateOptions = {
  userId: string;
  endpoint?: string;
  tusUploadId?: string;
  metadata?: Record<string, string>;
  onUrl?: (tusUploadId: string, expiresAt: string) => void;
  onProgress: (bytesSent: number) => void;
  onRetry: () => void;
  onSuccess: () => void | Promise<void>;
  onError: (error: Error) => void | Promise<void>;
  onForbidden: () => void | Promise<void>;
};

export type TusClientUpload = {
  start(): void;
  pause(): Promise<void>;
  cancel(): Promise<void>;
};

@Service()
export class TusClientService {
  private readonly tusUploadClass = inject(TUS_UPLOAD_CLASS);
  private readonly tokenGetter = inject(TUS_TOKEN_GETTER);
  private readonly configAppService = inject(ConfigAppService);
  private readonly userStore = inject(UserStore);

  create(file: File, options: TusClientCreateOptions): TusClientUpload {
    const tusUploadState = new this.tusUploadClass(file, {
      endpoint: options.endpoint,
      uploadUrl: options.tusUploadId ? `${this.configAppService.apiUrl()}/upload/${options.tusUploadId}` : undefined,
      uploadDataDuringCreation: false,
      metadata: options.metadata,
      chunkSize: CHUNK_SIZE,
      storeFingerprintForResuming: false,
      retryDelays: [0, 1000, 3000, 5000],
      onProgress: (bytesSent) => options.onProgress(bytesSent),
      onSuccess: () => options.onSuccess(),
      onError: (error) => options.onError(error),
      onShouldRetry: (error) => {
        const status = error.originalResponse?.getStatus();
        const retry = status === undefined || status >= HttpStatusCode.InternalServerError;
        if (retry) {
          options.onRetry();
        }
        return retry;
      },
      onAfterResponse: (request, response) => {
        const location = response.getHeader("Location");
        if (request.getMethod() === "POST" && location) {
          const tusUploadId = location.split("/").pop() ?? "";
          options.onUrl?.(tusUploadId, expiresAt(response.getHeader("Upload-Expires")));
        }
      },
      onBeforeRequest: async (request) => {
        const requestOrigin = new URL(request.getURL()).origin;
        const apiOrigin = new URL(this.configAppService.apiUrl()).origin;
        if (requestOrigin !== apiOrigin) {
          throw new Error(`Refused to send ${request.getURL()}: not the api origin ${apiOrigin}`);
        }
        if (this.userStore.myUser().id !== options.userId) {
          options.onForbidden();
          throw new Error(`Refused to send ${request.getURL()}: the upload belongs to another user`);
        }
        request.setHeader("Authorization", `Bearer ${this.tokenGetter()}`);
      },
    });
    return {
      start: () => tusUploadState.start(),
      pause: () => tusUploadState.abort(false),
      cancel: () => tusUploadState.abort(true),
    };
  }
}

export class InvalidUploadExpiresError extends Error {
  constructor(uploadExpires: string | undefined) {
    super(`Invalid Upload-Expires header: ${uploadExpires ?? "absent"}`);
  }
}

function expiresAt(uploadExpires: string | undefined): string {
  const expires = new Date(uploadExpires ?? "");
  if (Number.isNaN(expires.getTime())) {
    throw new InvalidUploadExpiresError(uploadExpires);
  }
  return expires.toISOString();
}

export function tusResponseStatus(error: Error): number | undefined {
  const response = (error as Partial<tus.DetailedError>).originalResponse;
  return response?.getStatus();
}

export function tusResponseBody(error: Error): string | undefined {
  const response = (error as Partial<tus.DetailedError>).originalResponse;
  return response?.getBody();
}
