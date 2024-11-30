import { inject, Injectable } from "@angular/core";
import {
  NotificationsService,
  NotificationsStore,
  StoryAssignNotification,
  Notification,
  StoryUnassignNotification,
} from "@tenzu/data/notifications";
import { lastValueFrom, Observable } from "rxjs";
import { UserStore } from "@tenzu/data/user";

@Injectable({
  providedIn: "root",
})
export class NotificationsComponentService {
  userStore = inject(UserStore);
  notificationsService = inject(NotificationsService);
  notificationsStore = inject(NotificationsStore);
  notifications = this.notificationsStore.entities;
  count = this.notificationsStore.count;

  async list() {
    const notifications = await lastValueFrom(this.notificationsService.list());
    this.notificationsStore.setNotifications(notifications);
  }
  async getCount() {
    const count = await lastValueFrom(this.notificationsService.count());
    this.notificationsStore.updateCount(count);
  }
  async read(notification: Notification) {
    const readNotification = await lastValueFrom(this.notificationsService.read(notification.id));
    this.notificationsStore.updateNotification(readNotification);
    this.notificationsStore.decreaseUnreadCount();
  }
  public getStoryUrl(notification: Notification): string {
    return `/workspace/${notification.content.project.workspaceId}/project/${notification.content.project.id}/story/${notification.content.story.ref}`;
  }

  public isCurrentUser(notification: StoryAssignNotification | StoryUnassignNotification) {
    switch (notification.type) {
      case "stories.assign": {
        return notification.content.assignedTo.username === this.userStore.myUser()?.username;
      }
      case "stories.unassign": {
        return notification.content.unassignedTo.username === this.userStore.myUser()?.username;
      }
    }
  }
  public getStoryName(notification: Notification): string {
    return `#${notification.content.story.ref} ${notification.content.story.title}`;
  }
}
