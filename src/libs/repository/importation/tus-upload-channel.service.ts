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

import { DestroyRef, ErrorHandler, inject, Service } from "@angular/core";
import { filter, map, Observable, Subject } from "rxjs";
import {
  TusChannelCommand,
  tusChannelCommandSchema,
  TusChannelMessage,
  tusChannelMessageSchema,
  TusUploadState,
} from "./tus-upload.model";

export type TusChannelCommandMessage = { type: TusChannelCommand; id: string };

@Service()
export class TusUploadChannel {
  private readonly errorHandler = inject(ErrorHandler);
  private readonly channel = new BroadcastChannel("tusUploads");
  private readonly messages = new Subject<TusChannelMessage>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.channel.close());
    this.channel.onmessage = (event: MessageEvent<unknown>) => {
      try {
        this.messages.next(tusChannelMessageSchema.parse(event.data));
      } catch (error) {
        this.errorHandler.handleError(error);
      }
    };
  }

  readonly state$: Observable<TusUploadState> = this.messages.pipe(
    filter((message) => message.type === "state"),
    map((message) => message.upload),
  );

  readonly command$: Observable<TusChannelCommandMessage> = this.messages.pipe(
    filter((message) => tusChannelCommandSchema.safeParse(message.type).success),
    map((message) => message as TusChannelCommandMessage),
  );

  readonly removed$: Observable<string> = this.messages.pipe(
    filter((message) => message.type === "removed"),
    map((message) => message.id),
  );

  readonly stop$: Observable<string> = this.messages.pipe(
    filter((message) => message.type === "stop"),
    map((message) => message.userId),
  );

  publishState(tusUploadState: TusUploadState): void {
    this.post({ type: "state", upload: tusUploadState });
  }

  sendCommand(type: TusChannelCommand, id: string): void {
    this.post({ type, id });
  }

  publishRemoved(id: string): void {
    this.post({ type: "removed", id });
  }

  publishStop(userId: string): void {
    this.post({ type: "stop", userId });
  }

  private post(message: TusChannelMessage): void {
    this.channel.postMessage(message);
  }
}
