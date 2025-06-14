/*
 * Copyright (C) 2024-2025 BIRU
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

/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2023-present Kaleidos INC
 */

import { EnvironmentInjector, inject, Injectable, isDevMode, runInInjectionContext, signal } from "@angular/core";

import { BehaviorSubject, Observable, of, repeat, retry, share, switchMap, throwError } from "rxjs";
import { catchError, filter } from "rxjs/operators";
import { Command, WSResponse, WSResponseAction, WSResponseActionSuccess, WSResponseEvent } from "../ws.model";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { FamilyEventType } from "./event-type.enum";
import { Router } from "@angular/router";
import {
  applyNotificationEvent,
  applyProjectEvent,
  applyProjectInvitationEventType,
  applyStoryAssignmentEvent,
  applyStoryAttachmentEvent,
  applyStoryEvent,
  applyUserEvent,
  applyWorkflowEvent,
  applyWorkflowStatusEvent,
  applyWorkspaceEvent,
  applyWorkspaceInvitationEventType,
} from "./apply-event.function";
import { debug } from "@tenzu/utils/functions/logging";
import { ConfigAppService } from "../../../../../app/config-app/config-app.service";
import { AuthService } from "@tenzu/repository/auth";

const MAX_RETRY = 10;
const RETRY_TIME = 10000;

@Injectable({
  providedIn: "root",
})
export class WsService {
  loggedSubject = new BehaviorSubject(false);
  logged$ = this.loggedSubject.asObservable();
  channelSubscribed = signal<{ channelWorkspaces: string[]; channelProjects: string[] }>({
    channelWorkspaces: [],
    channelProjects: [],
  });
  router = inject(Router);
  private environmentInjector = inject(EnvironmentInjector);
  private configAppService = inject(ConfigAppService);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private subject: WebSocketSubject<any> | undefined = undefined;
  private ws$: Observable<WSResponse> | undefined = undefined;

  async init() {
    // We want to keep those log for now
    console.log("init WS");
    console.log(this.configAppService.wsUrl());
    this.subject = webSocket({
      url: this.configAppService.wsUrl(),
      openObserver: {
        next: () => {
          debug("WS", "connected");
          const subcriptions = this.channelSubscribed();
          subcriptions.channelProjects.map((channel) => {
            const projectId = channel.split(".")[1];
            this.command({ command: "subscribe_to_project_events", project: projectId });
          });
          subcriptions.channelWorkspaces.map((channel) => {
            const workspaceId = channel.split(".")[1];
            this.command({ command: "subscribe_to_workspace_events", workspace: workspaceId });
          });
        },
      },
      closeObserver: {
        next: () => {
          debug("WS", "disconnected");
        },
      },
    });

    this.ws$ = this.subject.pipe(
      catchError((e) => {
        debug("WS", "the server are reload we loose the connexion and we need to login again", e);
        this.loggedSubject.next(false);
        this.command({ command: "signin", token: localStorage.getItem("token") || "" });
        return throwError(() => e);
      }),
      retry({ delay: RETRY_TIME, resetOnSuccess: true }),
      repeat({ count: MAX_RETRY, delay: RETRY_TIME }),
      share(),
    );

    this.ws$.subscribe((data) => this.dispatch(data as WSResponse));
  }

  async dispatch(message: WSResponse) {
    switch (message.type) {
      case "action": {
        await this.dispatchAction(message);
        break;
      }
      case "event": {
        await this.dispatchEvent(message);
        break;
      }
      case "system": {
        if (!isDevMode()) {
          console.error("received system error websocket", message);
        }
        break;
      }
      default: {
        debug("WS", "The type of the command is unknown", message);
        break;
      }
    }
  }

  async dispatchAction(message: WSResponseAction) {
    switch (message.status) {
      case "ok": {
        debug(
          "WS",
          `from the channel ${message?.content?.channel} received a response of the command ${message?.action?.command}`,
          message,
        );
        await this.manageSubscription(message);
        break;
      }
      case "error": {
        console.error(`[WS] the command ${message.action.command} received a error response`, message);
        break;
      }
      default: {
        debug("WS", "this command is unknown", message);
      }
    }
  }

  async manageSubscription(message: WSResponseActionSuccess) {
    switch (message.action.command) {
      case "signin": {
        this.loggedSubject.next(true);
        break;
      }
      case "signout": {
        await this.signoutFromServer();
        break;
      }
      case "subscribe_to_workspace_events": {
        this.channelSubscribed.update((value) => {
          value.channelWorkspaces = [...value.channelWorkspaces, message.content.channel];
          return value;
        });
        break;
      }
      case "subscribe_to_project_events": {
        this.channelSubscribed.update((value) => {
          value.channelProjects = [...value.channelProjects, message.content.channel];
          return value;
        });
        break;
      }
      case "unsubscribe_from_project_events": {
        this.channelSubscribed.update((value) => {
          value.channelProjects = value.channelProjects.filter(
            (channelProject) => channelProject !== message.content.channel,
          );
          return value;
        });
        break;
      }
      case "unsubscribe_from_workspace_events": {
        this.channelSubscribed.update((value) => {
          value.channelWorkspaces = value.channelWorkspaces.filter(
            (channelWorkspace) => channelWorkspace !== message.content.channel,
          );
          return value;
        });
        break;
      }
      default: {
        break;
      }
    }
  }

  async dispatchEvent(message: WSResponseEvent<unknown>) {
    if (message.event.correlationId === this.configAppService.correlationId) {
      return;
    }
    debug("WS", `from the channel ${message.channel} received the event ${message.event.type}`, message);

    const family = message.event.type.split(".")[0];
    await runInInjectionContext(this.environmentInjector, async () => {
      switch (family) {
        case FamilyEventType.Story: {
          await applyStoryEvent(message);
          break;
        }
        case FamilyEventType.Workflow: {
          await applyWorkflowEvent(message);
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
          await applyWorkspaceEvent(message);
          break;
        }
        case FamilyEventType.ProjectInvitation: {
          await applyProjectInvitationEventType(message);
          break;
        }
        case FamilyEventType.ProjectMembership: {
          // Add handling logic if required
          break;
        }
        case FamilyEventType.ProjectRole: {
          // Add handling logic if required
          break;
        }
        case FamilyEventType.WorkspaceInvitation: {
          await applyWorkspaceInvitationEventType(message);
          break;
        }
        case FamilyEventType.WorkspaceMembership: {
          // Add handling logic if required
          break;
        }
        case FamilyEventType.User: {
          await applyUserEvent(message);
          break;
        }
        case FamilyEventType.Notification: {
          applyNotificationEvent(message);
          break;
        }
      }
    });
  }

  public command(command: Command) {
    const subject = this.subject;
    if (!subject) {
      debug("WS", "not connected");
      return;
    }
    debug("WS", `sent the command ${command.command}`, command);
    if (command.command === "signin") {
      subject.next(command);
    } else if (command.command === "signout") {
      subject.next(command);
      this.signoutFromLocal();
    } else {
      this.logged$
        .pipe(
          filter((loggedIn) => loggedIn),
          switchMap(() => {
            if (command.command === "unsubscribe_from_workspace_events") {
              if (!(`workspaces.${command.workspace}` in this.channelSubscribed().channelWorkspaces)) {
                return of(null);
              }
            }
            if (command.command === "unsubscribe_from_project_events") {
              if (!(`projects.${command.project}` in this.channelSubscribed().channelProjects)) {
                return of(null);
              }
            }
            subject.next(command);
            return of(null);
          }),
        )
        .subscribe();
    }
  }

  signoutFromLocal() {
    this.loggedSubject.next(false);
  }
  async signoutFromServer() {
    this.signoutFromLocal();
    await runInInjectionContext(this.environmentInjector, async () => {
      const authService = inject(AuthService);
      authService.applyLogout();
    });
  }
}
