import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { BreadcrumbStore } from "@tenzu/data/breadcrumb";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ProjectStore } from "@tenzu/data/project";
import { JsonPipe } from "@angular/common";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { TranslocoDirective } from "@jsverse/transloco";
import { DescriptionFieldComponent } from "@tenzu/shared/components/form/description-field";
import { MatButton } from "@angular/material/button";
import { TranslatedSnackbarComponent } from "@tenzu/shared/components/translated-snackbar/translated-snackbar.component";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatIcon } from "@angular/material/icon";
import { ConfirmDirective } from "@tenzu/directives/confirm";
import { AvatarComponent } from "@tenzu/shared/components/avatar";

@Component({
  selector: "app-project-settings",
  standalone: true,
  imports: [
    JsonPipe,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    TranslocoDirective,
    DescriptionFieldComponent,
    MatButton,
    MatIcon,
    ConfirmDirective,
    AvatarComponent,
  ],
  template: `
    <div class="flex flex-col gap-y-8 w-min" *transloco="let t; prefix: 'project.settings'">
      <form class="flex flex-col gap-y-4" [formGroup]="form" (submit)="onSave()">
        <h1 class="mat-headline-medium">{{ t("title") }}</h1>
        <div class="flex flex-row gap-4 items-center">
          <app-avatar
            size="xl"
            [name]="form.controls.name.value!"
            [color]="projectStore.selectedEntity()!.color || 0"
          ></app-avatar>
          <mat-form-field>
            <mat-label>{{ t("name") }}</mat-label>
            <input formControlName="name" matInput required placeholder="name" data-testid="project-name-input" />
            @if (form.controls.name.hasError("required")) {
              <mat-error data-testid="project-name-required-error">{{ t("errors.name_required") }}</mat-error>
            }
          </mat-form-field>
        </div>
        <app-description-field
          [options]="{ descriptionMaxLength: 200, maxRows: 8 }"
          formControlName="description"
        ></app-description-field>
        <div class="flex gap-x-4 mt-2">
          <button mat-flat-button type="submit" class="primary-button" data-testid="project-edit-submit">
            {{ t("buttons.save") }}
          </button>
          <button mat-flat-button (click)="reset()" class="secondary-button">
            {{ t("buttons.cancel") }}
          </button>
        </div>
      </form>
      <div class="flex flex-col gap-y-2">
        <h2 class="mat-headline-small">{{ t("delete_project_title") }}</h2>
        <div class="flex flex-row">
          <mat-icon class="text-error-40 pr-3 self-center">warning</mat-icon>
          <p class="mat-body-medium text-error-40 align-middle">
            {{ t("delete_project_warning") }}
          </p>
        </div>
        <button
          mat-flat-button
          class="error-button w-fit"
          appConfirm
          [data]="{ deleteAction: true }"
          (popupConfirm)="onDelete()"
        >
          {{ t("buttons.delete") }}
        </button>
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectSettingsComponent {
  _snackBar = inject(MatSnackBar);
  breadcrumbStore = inject(BreadcrumbStore);
  projectStore = inject(ProjectStore);
  router = inject(Router);
  fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    name: [this.projectStore.selectedEntity()?.name, Validators.required],
    description: [this.projectStore.selectedEntity()?.description],
  });
  constructor() {
    this.breadcrumbStore.setFifthLevel({
      label: "workspace.general_title.projectSettings",
      link: "",
      doTranslation: true,
    });
    this.breadcrumbStore.setSixthLevel(undefined);
  }

  async onSave() {
    this.form.reset(this.form.value);
    if (this.form.valid) {
      await this.projectStore.patchSelectedEntity(this.form.getRawValue());
      this._snackBar.openFromComponent(TranslatedSnackbarComponent, {
        duration: 3000,
        data: {
          message: "settings.project.messages.saved",
          var: "",
        },
      });
    }
  }

  onDelete() {
    this.projectStore.deleteSelectedEntity().then((deleted) => {
      this.router.navigateByUrl("/");
      this._snackBar.openFromComponent(TranslatedSnackbarComponent, {
        duration: 3000,
        data: {
          message: "settings.project.messages.deleted",
          var: deleted.name,
        },
      });
    });
  }

  reset() {
    const selectedEntity = this.projectStore.selectedEntity();
    if (selectedEntity) {
      this.form.reset({ ...selectedEntity });
    }
  }
}
