import { inject, Injectable } from "@angular/core";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";
import {
  NotificationMessage,
  NotificationMessageError,
  NotificationMessageModel,
  NotificationMessageSuccess,
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
}
