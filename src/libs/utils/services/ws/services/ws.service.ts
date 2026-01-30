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

import {
  DestroyRef,
  EnvironmentInjector,
  inject,
  Injectable,
  isDevMode,
  runInInjectionContext,
  signal,
} from "@angular/core";

import {
  BehaviorSubject,
  defer,
  EMPTY,
  exhaustMap,
  interval,
  Observable,
  of,
  repeat,
  retry,
  share,
  Subject,
  Subscription,
  switchMap,
  take,
  tap,
  throwError,
} from "rxjs";
import { catchError, filter, map } from "rxjs/operators";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Command, WSResponse, WSResponseAction, WSResponseActionSuccess, WSResponseEvent } from "../ws.model";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { FamilyEventType } from "./event-type.enum";
import { NavigationEnd, Router } from "@angular/router";
import {
  applyNotificationEvent,
  applyProjectEvent,
  applyProjectInvitationEventType,
  applyProjectMembershipEventType,
  applyProjectRoleEventType,
  applyStoryAssignmentEvent,
  applyStoryAttachmentEvent,
  applyStoryCommentEvent,
  applyStoryEvent,
  applyUserEvent,
  applyWorkflowEvent,
  applyWorkflowStatusEvent,
  applyWorkspaceEvent,
  applyWorkspaceInvitationEventType,
  applyWorkspaceMembershipEventType,
} from "./apply-event.function";
import { debug } from "@tenzu/utils/functions/logging";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
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
  private destroyRef = inject(DestroyRef);
  private environmentInjector = inject(EnvironmentInjector);
  private configAppService = inject(ConfigAppService);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private subject: WebSocketSubject<any> | undefined = undefined;
  private ws$: Observable<WSResponse> | undefined = undefined;

  private opened$ = new Subject<void>();

  private signinRecoveryOngoing = false;
  private previouslyInWorkspace: boolean | null = null;
  private heartbeatSubscription: Subscription | null = null;
  private readonly heartbeatIntervalMs = 10000;
  private initialized = false;

  async init() {
    if (this.initialized) {
      debug("WS", "init skipped: already initialized");
      return;
    }
    this.initialized = true;
    const url = `${this.configAppService.wsUrl()}/events/`;
    // We want to keep those log for now
    console.log("init WS");
    this.opened$
      .pipe(
        exhaustMap(() => this.signinFlow()),
        catchError((e) => {
          // We log, but we don't break the reconnection
          debug("WS", "signin failed", e);
          return of(void 0);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    const createSocket$ = defer(() => {
      this.subject = webSocket({
        url,
        openObserver: {
          next: () => {
            debug("WS", "connected");
            this.opened$.next();
            this.startHeartbeat();
          },
        },
        closeObserver: {
          next: () => {
            debug("WS", "disconnected");
            this.loggedSubject.next(false);
            this.stopHeartbeat();
          },
        },
      });

      return this.subject as Observable<WSResponse>;
    });

    this.ws$ = createSocket$.pipe(
      catchError((e) => {
        debug("WS", "socket error", e);
        this.loggedSubject.next(false);
        return throwError(() => e);
      }),
      retry({ delay: RETRY_TIME, resetOnSuccess: true }),
      repeat({ count: MAX_RETRY, delay: RETRY_TIME }),
      share(),
    );

    this.ws$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => this.dispatch(data as WSResponse));

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event) => (event as NavigationEnd).urlAfterRedirects || (event as NavigationEnd).url),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((url) => {
        const inWorkspace = url.startsWith("/workspace/");
        if (this.previouslyInWorkspace === null) {
          this.previouslyInWorkspace = inWorkspace;
          return;
        }
        if (this.previouslyInWorkspace && !inWorkspace) {
          this.command({ command: "unsubscribe_all_except_user_channel" });
        }
        this.previouslyInWorkspace = inWorkspace;
      });
  }

  private signinFlow(): Observable<void> {
    // reset when new connection
    this.loggedSubject.next(false);

    return runInInjectionContext(this.environmentInjector, () => {
      const authService = inject(AuthService);

      return authService.isLoginOk().pipe(
        switchMap((ok) => {
          if (!ok) {
            // No valid tokens -> do not attempt WS signin
            return EMPTY;
          }
          const token = authService.getToken().access || "";
          if (!token) {
            return EMPTY;
          }

          this.command({ command: "signin", token });

          // Wait for success acknowledgment (loggedSubject becomes true in manageSubscription)
          return this.logged$.pipe(
            filter(Boolean),
            take(1),
            tap(() => this.restoreSubscriptions()),
            map(() => void 0),
          );
        }),
      );
    });
  }

  private restoreSubscriptions() {
    const subcriptions = this.channelSubscribed();

    subcriptions.channelProjects.forEach((channel) => {
      const projectId = channel.split(".")[1];
      this.command({ command: "subscribe_to_project_events", project: projectId });
    });

    subcriptions.channelWorkspaces.forEach((channel) => {
      const workspaceId = channel.split(".")[1];
      this.command({ command: "subscribe_to_workspace_events", workspace: workspaceId });
    });
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
        // Ignore "not-signed-in" error when attempting to sign out while already signed out
        if (message.action.command === "signout" && message.content.detail === "not-signed-in") {
          break;
        }
        if (message.action.command === "signin") {
          this.loggedSubject.next(false);
          this.recoverSignin();
          break;
        }

        console.error(`[WS] the command ${message.action.command} received a error response`, message);
        break;
      }
      default: {
        debug("WS", "this command is unknown", message);
      }
    }
  }

  private recoverSignin() {
    if (this.signinRecoveryOngoing) {
      return;
    }

    this.signinRecoveryOngoing = true;

    runInInjectionContext(this.environmentInjector, () => {
      const authService = inject(AuthService);

      const refreshToken = authService.getToken().refresh;
      if (!refreshToken) {
        this.signinRecoveryOngoing = false;
        return;
      }

      authService
        .refresh({ refresh: refreshToken })
        .pipe(
          take(1),
          tap(() => {
            const newAccess = authService.getToken().access || "";
            if (newAccess) {
              this.command({ command: "signin", token: newAccess });
            }
          }),
          catchError((e) => {
            // If refresh fails, let AuthService handle the global state (autoLogout) / navigation.
            debug("WS", "refresh failed during signin recovery", e);
            return of(null);
          }),
          tap(() => {
            this.signinRecoveryOngoing = false;
          }),
        )
        .subscribe();
    });
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
          if (!value.channelWorkspaces.includes(message.content.channel)) {
            value.channelWorkspaces = [...value.channelWorkspaces, message.content.channel];
          }
          return value;
        });
        break;
      }
      case "subscribe_to_project_events": {
        this.channelSubscribed.update((value) => {
          if (!value.channelProjects.includes(message.content.channel)) {
            value.channelProjects = [...value.channelProjects, message.content.channel];
          }
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
      case "ping": {
        debug("WS", "received pong");
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
        case FamilyEventType.StoryComment: {
          applyStoryCommentEvent(message);
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
          await applyProjectMembershipEventType(message);
          break;
        }
        case FamilyEventType.ProjectRole: {
          await applyProjectRoleEventType(message);
          break;
        }
        case FamilyEventType.WorkspaceInvitation: {
          await applyWorkspaceInvitationEventType(message);
          break;
        }
        case FamilyEventType.WorkspaceMembership: {
          await applyWorkspaceMembershipEventType(message);
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
          take(1),
          switchMap(() => {
            if (command.command === "unsubscribe_all_except_user_channel") {
              const subscriptions = this.channelSubscribed();
              if (subscriptions.channelProjects.length === 0 && subscriptions.channelWorkspaces.length === 0) {
                return of(null);
              }
              this.channelSubscribed.update((value) => {
                value.channelProjects = [];
                value.channelWorkspaces = [];
                return value;
              });
              subject.next(command);
              return of(null);
            }
            if (command.command === "unsubscribe_from_workspace_events") {
              if (!this.channelSubscribed().channelWorkspaces.includes(`workspaces.${command.workspace}`)) {
                return of(null);
              }
            }
            if (command.command === "unsubscribe_from_project_events") {
              if (!this.channelSubscribed().channelProjects.includes(`projects.${command.project}`)) {
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
    // Clear cached subscriptions so a new session starts clean
    this.channelSubscribed.set({ channelWorkspaces: [], channelProjects: [] });
    this.previouslyInWorkspace = null;
    this.stopHeartbeat();
  }
  async signoutFromServer() {
    this.signoutFromLocal();
    await runInInjectionContext(this.environmentInjector, async () => {
      const authService = inject(AuthService);
      authService.applyLogout();
    });
  }

  startHeartbeat() {
    if (this.heartbeatSubscription) {
      return;
    }
    this.heartbeatSubscription = interval(this.heartbeatIntervalMs).subscribe(() => {
      debug("WS", "sending ping");
      this.command({ command: "ping" });
    });
  }

  stopHeartbeat() {
    if (!this.heartbeatSubscription) {
      return;
    }
    this.heartbeatSubscription.unsubscribe();
    this.heartbeatSubscription = null;
  }
}
