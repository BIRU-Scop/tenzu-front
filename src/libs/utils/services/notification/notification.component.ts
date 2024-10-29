import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBar,
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarLabel,
} from "@angular/material/snack-bar";
import { NotificationMessage } from "./notification-message.model";
import { MatIcon } from "@angular/material/icon";
import { MatIconButton } from "@angular/material/button";
import { TranslocoDirective } from "@jsverse/transloco";
import { NgTemplateOutlet } from "@angular/common";

@Component({
  selector: "app-notification",
  standalone: true,
  imports: [
    MatSnackBarLabel,
    MatSnackBarActions,
    MatIcon,
    MatIconButton,
    MatSnackBarAction,
    TranslocoDirective,
    NgTemplateOutlet,
  ],
  template: ` <div class="flex flex-row-reverse items-center" *transloco="let t">
    <ng-template #content let-data="data">
      <div matSnackBarLabel>
        <p>
          @if (data.translocoTitle) {
            {{ t(data.title, data.translocoTitleParams) }}
          } @else {
            {{ data.title }}
          }
        </p>
        <p>
          @if (data.translocoDetail && data.detail) {
            {{ t(data.detail, data.translocoDetailParams) }}
          } @else if (data.detail) {
            {{ data.detail }}
          }
        </p>
      </div>
    </ng-template>
    <div class="flex" matSnackBarActions>
      <button mat-icon-button matSnackBarAction (click)="close()">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    @switch (data.type) {
      @case ("error") {
        <ng-container [ngTemplateOutlet]="content" [ngTemplateOutletContext]="{ data: data }"></ng-container>
      }
      @case ("success") {
        <ng-container [ngTemplateOutlet]="content" [ngTemplateOutletContext]="{ data: data }"></ng-container>
      }
    }
  </div>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent {
  data: NotificationMessage = inject(MAT_SNACK_BAR_DATA);
  matSnackBar = inject(MatSnackBar);

  close() {
    this.matSnackBar.dismiss();
  }
}
