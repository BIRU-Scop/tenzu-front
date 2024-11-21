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
import { StoryAssign, StoryAttachment, StoryDetail, StoryReorderPayloadEvent, StoryStore } from "@tenzu/data/story";
import { StatusDetail } from "@tenzu/data/status";
import { Workflow, WorkflowStatusReorderPayload, WorkflowStore } from "@tenzu/data/workflow";
import {
  FamilyEventType,
  ProjectEventType,
  StoryAssignmentEventType,
  StoryAttachmentEventType,
  StoryEventType,
  WorkflowEventType,
  WorkflowStatusEventType,
} from "./event-type.enum";
import { ProjectStore } from "@tenzu/data/project";
import { WorkspaceStore } from "@tenzu/data/workspace";
import { Router } from "@angular/router";
import { toObservable } from "@angular/core/rxjs-interop";
import { filterNotNull } from "@tenzu/utils";
import { NotificationService } from "../../notification";
import { UserMinimal } from "@tenzu/data/user";
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
  notificationService = inject(NotificationService);
  workspaceStore = inject(WorkspaceStore);
  projectStore = inject(ProjectStore);
  workflowStore = inject(WorkflowStore);
  storyStore = inject(StoryStore);
  router = inject(Router);
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

  async doStoryEvent(message: WSResponseEvent<unknown>) {
    switch (message.event.type) {
      case StoryEventType.CreateStory: {
        const content = message.event.content as { story: StoryDetail };
        this.storyStore.add(content.story);
        break;
      }
      case StoryEventType.UpdateStory: {
        const content = message.event.content as { story: StoryDetail };
        this.storyStore.update(content.story);
        break;
      }
      case StoryEventType.ReorderStory: {
        const content = message.event.content as {
          reorder: StoryReorderPayloadEvent;
        };
        this.storyStore.reorderStoryByEvent(content.reorder);
        break;
      }
      case StoryEventType.DeleteStory: {
        const content = message.event.content as {
          ref: number;
          deletedBy: {
            color: number;
            fullName: string;
            username: string;
          };
        };
        const project = this.projectStore.selectedEntity();
        const workflow = this.workflowStore.selectedEntity();
        const workspace = this.workspaceStore.selectedEntity();
        this.storyStore.removeStory(content.ref);
        if (this.router.url === `/workspace/${workspace!.id}/project/${project!.id}/story/${content.ref}`) {
          await this.router.navigateByUrl(
            `/workspace/${workspace!.id}/project/${project!.id}/kanban/${workflow!.slug}`,
          );
          this.notificationService.warning({
            title: "notification.events.delete_story",
            translocoTitleParams: {
              username: content.deletedBy.username,
              ref: content.ref,
            },
          });
        }
        break;
      }
    }
  }

  doWorkflowEvent(message: WSResponseEvent<unknown>) {
    switch (message.event.type) {
      case WorkflowEventType.CreateWorkflow: {
        const content = message.event.content as { workflow: Workflow };
        this.projectStore.addWorkflow(content.workflow);

        break;
      }
      case WorkflowEventType.UpdateWorkflow: {
        break;
      }
      case WorkflowEventType.DeleteWorkflow: {
        break;
      }
    }
  }
  async doWorkflowStatusEvent(message: WSResponseEvent<unknown>) {
    switch (message.event.type) {
      case WorkflowStatusEventType.CreateWorkflowStatus: {
        const content = message.event.content as { workflowStatus: StatusDetail };
        this.workflowStore.addStatus(content.workflowStatus);
        break;
      }
      case WorkflowStatusEventType.UpdateWorkflowStatus: {
        const content = message.event.content as { workflowStatus: StatusDetail };
        this.workflowStore.updateStatus(content.workflowStatus);
        break;
      }
      case WorkflowStatusEventType.DeleteWorkflowStatus: {
        const content = message.event.content as { workflowStatus: StatusDetail; targetStatus: StatusDetail };
        this.workflowStore.removeStatus(content.workflowStatus.id);
        this.storyStore.deleteStatusGroup(content.workflowStatus.id, content.targetStatus);
        break;
      }
      case WorkflowStatusEventType.ReorderWorkflowStatus: {
        const content = message.event.content as {
          reorder: WorkflowStatusReorderPayload & { workflow: Workflow };
        };
        await this.workflowStore.refreshWorkflow(content.reorder.workflow);
        break;
      }
    }
  }
  doStoryAssignmentEvent(message: WSResponseEvent<unknown>) {
    switch (message.event.type) {
      case StoryAssignmentEventType.CreateStoryAssignment: {
        const content = message.event.content as { storyAssignment: StoryAssign };
        this.storyStore.addAssign(content.storyAssignment, content.storyAssignment.story.ref);
        break;
      }
      case StoryAssignmentEventType.DeleteStoryAssignment: {
        const content = message.event.content as { storyAssignment: StoryAssign };
        this.storyStore.removeAssign(content.storyAssignment.story.ref, content.storyAssignment.user.username);
        break;
      }
    }
  }
  doSStoryAttachmentEvent(message: WSResponseEvent<unknown>) {
    switch (message.event.type) {
      case StoryAttachmentEventType.CreateStoryAttachment: {
        const content = message.event.content as { attachment: StoryAttachment; ref: number };
        this.storyStore.addAttachment(content.attachment, content.ref);
        break;
      }
      case StoryAttachmentEventType.DeleteStoryAttachment: {
        const content = message.event.content as { attachment: StoryAttachment; ref: number };
        this.storyStore.removeAttachment(content.attachment.id);
        break;
      }
    }
  }
  async doProjectEvent(message: WSResponseEvent<unknown>) {
    switch (message.event.type) {
      case ProjectEventType.ProjectDelete: {
        const content = message.event.content as {
          deletedBy: UserMinimal;
          project: string;
          workspace: string;
          name: string;
        };
        const currentProject = this.projectStore.selectedEntity();
        this.projectStore.removeEntity(content.project);
        if (currentProject && currentProject.id === content.project) {
          await this.router.navigateByUrl("/");
          this.projectStore.resetSelectedEntity();
        }

        this.notificationService.warning({
          title: "notification.events.delete_project",
          translocoTitleParams: {
            username: content.deletedBy.username,
            name: content.name,
          },
        });
        break;
      }
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
    switch (family) {
      case FamilyEventType.Story: {
        await this.doStoryEvent(message);
        break;
      }
      case FamilyEventType.Workflow: {
        this.doWorkflowEvent(message);
        break;
      }
      case FamilyEventType.WorkflowStatuses: {
        await this.doWorkflowStatusEvent(message);
        break;
      }
      case FamilyEventType.StoryAssignment: {
        this.doStoryAssignmentEvent(message);
        break;
      }
      case FamilyEventType.StoryAttachment: {
        this.doSStoryAttachmentEvent(message);
        break;
      }
      case FamilyEventType.Project: {
        await this.doProjectEvent(message);
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
