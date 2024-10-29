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

export class NotificationInfoError extends NotificationMessage {
  type: TypeMessageModel = "info";
}
