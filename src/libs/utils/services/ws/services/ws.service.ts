/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2023-present Kaleidos INC
 */

import { inject, Injectable } from "@angular/core";

import { BehaviorSubject, of, repeat, retry, share, switchMap, throwError } from "rxjs";
import { catchError, filter } from "rxjs/operators";
import { Command, WSResponse, WSResponseAction, WSResponseEvent } from "../ws.model";
import { ConfigServiceService } from "../../config-service";
import { webSocket } from "rxjs/webSocket";
import { StoryDetail, StoryReorderPayload } from "@tenzu/data/story";
import { StatusDetail } from "@tenzu/data/status";

const MAX_RETRY = 10;
const RETRY_TIME = 10000;

@Injectable({
  providedIn: "root",
})
export class WsService {
  private config = inject(ConfigServiceService);
  private subject = webSocket({
    url: this.config.environment.wsUrl,
  });
  loggedSubject = new BehaviorSubject(false);
  logged$ = this.loggedSubject.asObservable();
  ws$ = this.subject.pipe(
    catchError((e) => {
      // the server are reload we loose the connexion and we need to login again
      // TODO find a way to unsubscribe to the channels were subscribed in the previous session
      this.loggedSubject.next(false);
      this.command({ command: "signin", token: localStorage.getItem("token") || "" });
      return throwError(() => e);
    }),
    retry({ delay: RETRY_TIME, resetOnSuccess: true }),
    repeat({ count: MAX_RETRY, delay: RETRY_TIME }),
    share(),
  );
  constructor() {
    this.ws$.subscribe((data) => this.dispatch(data as WSResponse));
  }
  dispatch(message: WSResponse) {
    switch (message.type) {
      case "action":
        this.dispatchAction(message);
        break;
      case "event":
        this.dispatchEvent(message);
        break;
      case "system":
        if (!this.config.environment.production) {
          console.error("received system error websocket", message);
        }
        break;
    }
  }
  dispatchAction(message: WSResponseAction) {
    if (!this.config.environment.production) {
      console.log("received action websocket", message);
    }
    switch (message.action.command) {
      case "signin":
        this.loggedSubject.next(true);
        break;
    }
  }
  dispatchEvent(message: WSResponseEvent<unknown>) {
    if (message.event.correlationId === this.config.correlationId) {
      return;
    }
    if (!this.config.environment.production) {
      console.log("received event websocket", message);
    }

    switch (message.event.type) {
      case "stories.create": {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const stories = message.event.content as StoryDetail;
        break;
      }
      case "stories.reorder": {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const reorder = message.event.content as StoryReorderPayload;
        break;
      }
      case "workflowstatuses.create": {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const status = message.event.content as StatusDetail;
        break;
      }
    }
  }

  public command(command: Command) {
    if (!this.config.environment.production) {
      console.log("sent command websocket", command);
    }
    if (command.command === "signin") {
      this.subject.next(command);
    } else {
      this.logged$
        .pipe(
          filter((loggedIn) => loggedIn),
          switchMap(() => {
            this.subject.next(command);
            return of();
          }),
        )
        .subscribe();
    }
  }
}
