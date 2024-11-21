/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2023-present Kaleidos INC
 */

import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from "@angular/core";

import { BehaviorSubject, of, repeat, retry, share, switchMap, throwError } from "rxjs";
import { catchError, filter } from "rxjs/operators";
import { Command, WSResponse, WSResponseAction, WSResponseEvent } from "../ws.model";
import { ConfigServiceService } from "../../config-service";
import { webSocket } from "rxjs/webSocket";
import { FamilyEventType } from "./event-type.enum";
import { ProjectStore } from "@tenzu/data/project";
import { WorkspaceStore } from "@tenzu/data/workspace";
import { Router } from "@angular/router";
import { toObservable } from "@angular/core/rxjs-interop";
import { filterNotNull } from "@tenzu/utils";
import {
  applyProjectEvent,
  applyStoryAssignmentEvent,
  applyStoryAttachmentEvent,
  applyStoryEvent,
  applyWorkflowEvent,
  applyWorkflowStatusEvent,
} from "./apply-event.function";

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
  workspaceStore = inject(WorkspaceStore);
  projectStore = inject(ProjectStore);
  router = inject(Router);
  private environmentInjector = inject(EnvironmentInjector);

  constructor() {
    this.ws$.subscribe((data) => this.dispatch(data as WSResponse));
    toObservable(this.workspaceStore.command)
      .pipe(filterNotNull())
      .subscribe((command) => this.command(command));
    toObservable(this.projectStore.command)
      .pipe(filterNotNull())
      .subscribe((command) => this.command(command));
  }
  async dispatch(message: WSResponse) {
    switch (message.type) {
      case "action":
        this.dispatchAction(message);
        break;
      case "event":
        await this.dispatchEvent(message);
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

  async dispatchEvent(message: WSResponseEvent<unknown>) {
    if (message.event.correlationId === this.config.correlationId) {
      return;
    }
    if (!this.config.environment.production) {
      console.log("received event websocket", message);
    }

    const family = message.event.type.split(".")[0];
    await runInInjectionContext(this.environmentInjector, async () => {
      switch (family) {
        case FamilyEventType.Story: {
          await applyStoryEvent(message);
          break;
        }
        case FamilyEventType.Workflow: {
          applyWorkflowEvent(message);
          break;
        }
        case FamilyEventType.WorkflowStatuses: {
          await applyWorkflowStatusEvent(message);
          break;
        }
        case FamilyEventType.StoryAssignment: {
          applyStoryAssignmentEvent(message);
          break;
        }
        case FamilyEventType.StoryAttachment: {
          applyStoryAttachmentEvent(message);
          break;
        }
        case FamilyEventType.Project: {
          await applyProjectEvent(message);
          break;
        }
        case FamilyEventType.Workspace: {
          break;
        }
        case FamilyEventType.ProjectInvitation: {
          // Add handling logic if required
          break;
        }
        case FamilyEventType.ProjectMembership: {
          // Add handling logic if required
          break;
        }
        case FamilyEventType.WorkspaceInvitation: {
          // Add handling logic if required
          break;
        }
        case FamilyEventType.WorkspaceMembership: {
          // Add handling logic if required
          break;
        }
      }
    });
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
            return of(null);
          }),
        )
        .subscribe();
    }
  }
}
