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

import { inject, Injectable } from "@angular/core";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";
import {
  NotificationMessage,
  NotificationMessageError,
  NotificationMessageInfo,
  NotificationMessageModel,
  NotificationMessageSuccess,
  NotificationMessageWarning,
} from "./notification-message.model";
import { NotificationComponent } from "./notification.component";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  snackBar = inject(MatSnackBar);
  open(message: NotificationMessage, config?: MatSnackBarConfig) {
    const ref = this.snackBar.openFromComponent(NotificationComponent, {
      ...{
        data: message,
        duration: 5000,
        verticalPosition: "top",
        horizontalPosition: "right",
        panelClass: `snackbar-${message.type}`,
      },
      ...config,
    });
    ref.onAction().subscribe(() => ref.dismiss());
  }
  success(message: NotificationMessageModel, config?: MatSnackBarConfig) {
    this.open(new NotificationMessageSuccess(message), config);
  }
  error(message: NotificationMessageModel, config?: MatSnackBarConfig) {
    this.open(new NotificationMessageError(message), config);
  }
  warning(message: NotificationMessageModel, config?: MatSnackBarConfig) {
    this.open(new NotificationMessageWarning(message), config);
  }
  info(message: NotificationMessageModel, config?: MatSnackBarConfig) {
    this.open(new NotificationMessageInfo(message), config);
  }
}
