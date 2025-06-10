/*
 * Copyright (C) 2025 BIRU
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

export type CommandActionType =
  | "signin"
  | "signout"
  | "subscribe_to_project_events"
  | "unsubscribe_from_project_events"
  | "subscribe_to_workspace_events"
  | "unsubscribe_from_workspace_events"
  | "ping";

export type CommandBase = {
  command: CommandActionType;
};
export type SignInAction = CommandBase & {
  command: "signin";
  token: string;
};

export type SignOutAction = CommandBase & {
  command: "signout";
};
export type SubscribeToProjectEventsAction = CommandBase & {
  command: "subscribe_to_project_events";
  project: string;
};
export type UnsubscribeFromProjectEventsAction = CommandBase & {
  command: "unsubscribe_from_project_events";
  project: string;
};
export type SubscribeToWorkspaceEventsAction = CommandBase & {
  command: "subscribe_to_workspace_events";
  workspace: string;
};
export type UnSubscribeFromWorkspaceEventsAction = CommandBase & {
  command: "unsubscribe_from_workspace_events";
  workspace: string;
};
export type PingActions = CommandBase & {
  command: "ping";
};

export type Command =
  | SignInAction
  | SignOutAction
  | PingActions
  | SubscribeToProjectEventsAction
  | UnsubscribeFromProjectEventsAction
  | SubscribeToWorkspaceEventsAction
  | UnSubscribeFromWorkspaceEventsAction;

export interface WSResponseActionBase {
  type: "action";
  action: {
    command: CommandActionType;
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
