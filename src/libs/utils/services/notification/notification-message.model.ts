/*
 * Copyright (C) 2024 BIRU
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

type TypeMessageModel = "error" | "info" | "warning" | "success";

export type NotificationMessageModel = {
  title: string;
  translocoTitle?: boolean;
  translocoTitleParams?: object;
  detail?: string;
  translocoDetail?: boolean;
  translocoDetailParams?: object;
};

export abstract class NotificationMessage {
  abstract type: TypeMessageModel;
  title: string;
  translocoTitle?: boolean;
  translocoTitleParams?: object;
  detail?: string;
  translocoDetail?: boolean;
  translocoDetailParams?: object;

  constructor(notificationMessage: NotificationMessageModel) {
    this.title = notificationMessage.title;
    this.detail = notificationMessage.detail;
    this.translocoTitle = notificationMessage.translocoTitle === undefined ? true : notificationMessage.translocoTitle;
    this.translocoDetail =
      notificationMessage.translocoDetail === undefined ? true : notificationMessage.translocoDetail;
    this.translocoTitleParams =
      notificationMessage.translocoTitleParams === undefined ? {} : notificationMessage.translocoTitleParams;
    this.translocoDetailParams =
      notificationMessage.translocoDetailParams === undefined ? {} : notificationMessage.translocoDetailParams;
  }
}

export class NotificationMessageSuccess extends NotificationMessage {
  type: TypeMessageModel = "success";
}

export class NotificationMessageError extends NotificationMessage {
  type: TypeMessageModel = "error";
}

export class NotificationMessageInfo extends NotificationMessage {
  type: TypeMessageModel = "info";
}

export class NotificationMessageWarning extends NotificationMessage {
  type: TypeMessageModel = "warning";
}
