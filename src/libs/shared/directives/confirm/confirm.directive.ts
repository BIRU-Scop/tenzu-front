import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  HostListener,
  inject,
  input,
  InputSignal,
  output,
} from "@angular/core";
import { MatButton } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from "@angular/material/dialog";
import { JsonPipe, NgComponentOutlet } from "@angular/common";
import { TranslocoDirective } from "@jsverse/transloco";

export type ConfirmPopupData = {
  title?: string;
  message?: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component?: any;
  deleteAction: boolean;
};

@Component({
  selector: "app-confirm-popup-component",
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [``],
  template: `
    <ng-container *transloco="let t; prefix: 'directives.confirmPopupComponent'">
      @if (data().title) {
        <h2 id="aria-label" mat-dialog-title>{{ data().title }}</h2>
      }

      <mat-dialog-content class=".mat-body-medium">
        @if (data().component) {
          <ng-container *ngComponentOutlet="data().component"></ng-container>
        } @else {
          @if (data().message) {
            <p>{{ data().message }}</p>
          } @else if (data().deleteAction) {
            <p>{{ t("textDelete") }}</p>
          } @else {
            <p>{{ t("textConfirm") }}</p>
          }
        }
      </mat-dialog-content>
      <mat-dialog-actions [align]="'end'">
        <button mat-flat-button class="secondary-button" [mat-dialog-close]="false">{{ t("cancelAction") }}</button>
        @if (data().deleteAction) {
          <button mat-flat-button class="error-button" [mat-dialog-close]="true">{{ t("deleteAction") }}</button>
        } @else {
          <button mat-flat-button class="primary-button" [mat-dialog-close]="true">{{ t("confirmAction") }}</button>
        }
      </mat-dialog-actions>
    </ng-container>
  `,
  standalone: true,
  imports: [
    MatDialogActions,
    MatButton,
    MatDialogClose,
    MatDialogContent,
    JsonPipe,
    NgComponentOutlet,
    TranslocoDirective,
    MatDialogTitle,
  ],
})
export class ConfirmPopupComponent {
  data: InputSignal<ConfirmPopupData> = inject(MAT_DIALOG_DATA);
  open = true;
  toggle() {
    this.open = !this.open;
  }
}

@Directive({
  selector: "[appConfirm]",
  standalone: true,
})
export class ConfirmDirective {
  dialog = inject(MatDialog);
  data = input<ConfirmPopupData>({
    deleteAction: false,
  });
  popupConfirm = output<void>();

  @HostListener("click")
  onClick() {
    const ref = this.dialog.open<ConfirmPopupComponent, InputSignal<ConfirmPopupData>>(ConfirmPopupComponent, {
      data: this.data,
    });
    ref.afterClosed().subscribe((confirm) => {
      if (confirm) {
        this.popupConfirm.emit();
      }
    });
  }
}
