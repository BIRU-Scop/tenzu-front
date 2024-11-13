/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2023-present Kaleidos INC
 */

export type SignInAction = {
  command: "signin";
  token: string;
};

export type SignOutAction = {
  command: "signout";
};
export type SubscribeToProjectEventsAction = {
  command: "subscribe_to_project_events";
  project: string;
};
export type UnsubscribeToProjectEventsAction = {
  command: "unsubscribe_from_project_events";
  project: string;
};
export type SubscribeToWorkspaceEventsAction = {
  command: "subscribe_to_workspace_events";
  workspace: string;
};
export type UnSubscribeToWorkspaceEventsAction = {
  command: "unsubscribe_to_workspace_events";
  workspace: string;
};
export type PingActions = {
  command: "ping";
};

export type Command =
  | SignInAction
  | SignOutAction
  | PingActions
  | SubscribeToProjectEventsAction
  | UnsubscribeToProjectEventsAction
  | SubscribeToWorkspaceEventsAction
  | UnSubscribeToWorkspaceEventsAction;

export interface WSResponseActionBase {
  type: "action";
  action: {
    command: string;
    project?: string;
  };
}

export interface WSResponseActionSuccess extends WSResponseActionBase {
  status: "ok";
  content: {
    channel: string;
  };
}

export interface WSResponseActionError extends WSResponseActionBase {
  status: "error";
  content: {
    detail: string;
  };
}

export type WSResponseAction = WSResponseActionSuccess | WSResponseActionError;

export interface WSResponseEvent<T> {
  type: "event";
  channel: string;
  event: {
    type: string;
    content: T;
    correlationId: string;
  };
}

export interface WSResponseSystem {
  type: "system";
  status: string;
  content: Record<string, string | number | Record<string, string | number>>;
}

export type WSResponse = WSResponseEvent<unknown> | WSResponseAction | WSResponseSystem;
