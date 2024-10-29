import { ChangeDetectionStrategy, Component, inject, model } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { RandomColorService } from "@tenzu/utils/services";
import { MatOption, MatSelect, MatSelectTrigger } from "@angular/material/select";
import { TranslocoDirective } from "@jsverse/transloco";
import { combineLatestWith, filter } from "rxjs";
import { toObservable } from "@angular/core/rxjs-interop";
import { MatInput } from "@angular/material/input";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { DescriptionFieldComponent } from "@tenzu/shared/components/form/description-field";
import { ProjectService, ProjectStore } from "@tenzu/data/project";
import { Workspace, WorkspaceStore } from "@tenzu/data/workspace";

@Component({
  selector: "app-project-create-form",
  standalone: true,
  imports: [
    MatOption,
    AvatarComponent,
    MatSelectTrigger,
    MatSelect,
    MatLabel,
    MatFormField,
    TranslocoDirective,
    ReactiveFormsModule,
    DescriptionFieldComponent,
    RouterLink,
    MatButton,
    MatInput,
    MatError,
  ],
  template: `
    <div class="grid grid-cols-1 place-items-center place-content-center" *transloco="let t">
      <div class="w-min flex flex-col gap-y-8 py-4">
        <h1 class="mat-headline-medium">{{ t("project.new_project.title") }}</h1>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-y-4">
          <mat-form-field>
            <mat-label>{{ t("commons.workspace") }}</mat-label>
            <mat-select required [hidden]="!workspaceStore.isLoading()" formControlName="workspaceId">
              @if (selectedWorkspace(); as workspace) {
                <mat-select-trigger>{{ workspace.name }}</mat-select-trigger>
              }
              @for (workspace of workspaceStore.entities(); track workspace.id) {
                <mat-option value="{{ workspace.id }}">
                  <div class="flex gap-x-2 items-center">
                    <app-avatar size="sm" [name]="workspace.name" [color]="workspace.color" [rounded]="true" />
                    <span>{{ workspace.name }}</span>
                  </div>
                </mat-option>
              }
            </mat-select>
            @if (form.controls.workspaceId.hasError("required")) {
              <mat-error [innerHTML]="t('project.new_project.workspace_required')"></mat-error>
            }
          </mat-form-field>
          <mat-form-field>
            <mat-label>{{ t("project.new_project.name") }}</mat-label>
            <input formControlName="name" matInput required placeholder="name" data-testid="project-name-input" />
            @if (form.controls.name.hasError("required")) {
              <mat-error
                data-testid="project-name-required-error"
                [innerHTML]="t('project.new_project.name_required')"
              ></mat-error>
            } @else if (form.controls.name.hasError("maxlength")) {
              <mat-error
                data-testid="project-name-maxlength-error"
                [innerHTML]="t('form_errors.max_length', { length: 80 })"
              ></mat-error>
            }
          </mat-form-field>
          <app-description-field
            [options]="{ descriptionMaxLength: 200, maxRows: 8 }"
            formControlName="description"
          ></app-description-field>
          <app-avatar size="lg" [name]="form.controls.name.value" [color]="form.controls.color.value"></app-avatar>
          <div class="flex gap-x-4 mt-4">
            <button
              *transloco="let t; prefix: 'project.new_project'"
              mat-flat-button
              type="submit"
              class="primary-button"
              data-testid="new-project-submit"
            >
              {{ t("create_project") }}
            </button>
            <button mat-flat-button routerLink=".." class="secondary-button">
              {{ t("commons.cancel") }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCreateComponent {
  projectService = inject(ProjectService);
  projectStore = inject(ProjectStore);
  workspaceStore = inject(WorkspaceStore);
  router = inject(Router);
  selectedWorkspace = model<Workspace>();
  $entities = toObservable(this.workspaceStore.entities).pipe(filter((entities) => entities.length > 0));

  fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    name: ["", [Validators.required, Validators.maxLength(80)]],
    description: [""],
    color: [RandomColorService.randomColorPicker(), Validators.required],
    workspaceId: ["", Validators.required],
  });

  constructor(private route: ActivatedRoute) {
    if (!this.workspaceStore.entities().length) {
      this.workspaceStore.list();
    }
    this.route.queryParamMap.pipe(combineLatestWith(this.$entities)).subscribe(([paramMap]) => {
      const workspaceId = paramMap.get("workspaceId");
      if (workspaceId) {
        this.form.controls.workspaceId.setValue(workspaceId);
      }
    });

    this.form.valueChanges.subscribe((value) => {
      if (value.workspaceId) {
        this.selectedWorkspace.set(this.workspaceStore.entityMap()[value.workspaceId]);
      }
    });
  }

  onSubmit() {
    this.form.reset(this.form.value);
    if (this.form.valid) {
      this.projectService.create(this.form.getRawValue()).subscribe({
        error: (err) => console.log("error", err),
        next: (value) => {
          this.projectStore.addProject(value);
          this.router.navigateByUrl(`/workspace/${value.workspace.id}/project/${value.id}/kanban/main`);
        },
      });
    }
  }
}