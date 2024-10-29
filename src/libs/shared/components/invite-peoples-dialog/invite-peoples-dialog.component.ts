import { ChangeDetectionStrategy, Component, inject, model } from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from "@angular/material/dialog";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatDivider } from "@angular/material/divider";
import { MatIcon } from "@angular/material/icon";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { UserCardComponent } from "@tenzu/shared/components/user-card";
import {
  AbstractControl,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
} from "@angular/forms";
import { emailRegexPatternValidation } from "@tenzu/shared/components/form/email-field/utils";

export interface InvitePeopleDialogData {
  title: string;
  description: string;
}

export const emailsShouldBeValid: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (control.value) {
    const invalid_mails = control.value
      .split(",")
      .filter((value: string) => !emailRegexPatternValidation.test(value.trim()));
    if (invalid_mails.length > 0) {
      return { invalidEmail: invalid_mails };
    }
  }
  return null;
};

@Component({
  selector: "app-invite-peoples-dialog",
  standalone: true,
  imports: [
    TranslocoDirective,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    MatDivider,
    MatIcon,
    MatFormField,
    MatInput,
    UserCardComponent,
    MatIconButton,
    FormsModule,
    ReactiveFormsModule,
    MatError,
    MatLabel,
  ],
  template: `
    <ng-container *transloco="let t; prefix: 'component.invite_dialog'">
      <h2 id="aria-label" mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <div class="flex flex-col gap-4">
          <div [innerHTML]="data.description"></div>
          <form [formGroup]="form" (ngSubmit)="addToPeopleList()">
            <div class="flex flex-row gap-x-4 items-center">
              <mat-icon class="icon-lg">group_add</mat-icon>
              <mat-form-field>
                <mat-label>
                  {{ t("mailing_list") }}
                </mat-label>
                <input
                  matInput
                  placeholder="name1@amazing.com, sheepAreGreat@tenzu.sh, tenzu@missing.com"
                  class="w-fit grow"
                  formControlName="emailsToAdd"
                />
                @if (form.controls.emailsToAdd.hasError("invalidEmail")) {
                  <mat-error class="cross-validation-error-message alert alert-danger"
                    >{{ t("at_least_one_invalid_email") }} :
                    {{ form.controls.emailsToAdd.getError("invalidEmail") }}
                  </mat-error>
                }
              </mat-form-field>
              <button mat-flat-button class="primary-button" type="submit">
                {{ t("add") }}
              </button>
            </div>
          </form>
          <mat-divider></mat-divider>
          <div class="flex flex-col gap-y-4 px-12 py-4">
            @for (people of peoplesList(); track people) {
              <div class="flex flex-row">
                <app-user-card fullName="{{ people }}" class="grow"></app-user-card>
                <button mat-icon-button class="icon-md primary-button" (click)="removeFromPeopleList($index)">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            }
          </div>
          <mat-divider></mat-divider>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button
          mat-flat-button
          class="primary-button"
          [mat-dialog-close]="peoplesList()"
          [disabled]="!peoplesList().length"
        >
          {{ t("invite_peoples") }}
        </button>
        <button mat-button mat-dialog-close class="secondary-button">Cancel</button>
      </mat-dialog-actions>
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitePeoplesDialogComponent {
  fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    emailsToAdd: ["", emailsShouldBeValid],
  });
  data = inject<InvitePeopleDialogData>(MAT_DIALOG_DATA);
  peoplesList = model([] as string[]);

  addToPeopleList() {
    this.form.updateValueAndValidity();
    if (this.form.valid && this.form.value.emailsToAdd) {
      this.form.value.emailsToAdd.split(",").forEach((value) => {
        if (!this.peoplesList().includes(value)) {
          this.peoplesList().push(value);
        }
      });
      this.form.reset();
    }
  }

  removeFromPeopleList(index: number) {
    this.peoplesList().splice(index, 1);
  }
}
