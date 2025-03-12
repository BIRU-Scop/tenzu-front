/*
 * Copyright (C) 2024-2025 BIRU
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

import { ChangeDetectionStrategy, Component, inject, model } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MatError, MatFormField, MatLabel } from "@angular/material/form-field";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { RandomColorService } from "@tenzu/utils/services/random-color/random-color.service";
import { MatOption, MatSelect, MatSelectTrigger } from "@angular/material/select";
import { TranslocoDirective } from "@jsverse/transloco";
import { combineLatestWith, filter } from "rxjs";
import { toObservable } from "@angular/core/rxjs-interop";
import { MatInput } from "@angular/material/input";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { DescriptionFieldComponent } from "@tenzu/shared/components/form/description-field";
import { Workspace } from "@tenzu/repository/workspace";
import { ProjectRepositoryService } from "@tenzu/repository/project/project-repository.service";
import { WorkspaceRepositoryService } from "@tenzu/repository/workspace/workspace-repository.service";

@Component({
  selector: "app-project-create-form",
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
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-y-5">
          <mat-form-field>
            <mat-label>{{ t("commons.workspace") }}</mat-label>
            <mat-select required formControlName="workspaceId">
              <mat-select-trigger>{{ selectedWorkspace()?.name }}</mat-select-trigger>
              @for (workspace of workspaceService.entitiesSummary(); track workspace.id) {
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
              class="tertiary-button"
              data-testid="new-project-submit"
              [disabled]="!form.dirty || form.invalid"
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
export default class ProjectCreateComponent {
  projectService = inject(ProjectRepositoryService);
  workspaceService = inject(WorkspaceRepositoryService);
  router = inject(Router);
  selectedWorkspace = model<Workspace>();
  $entities = toObservable(this.workspaceService.entitiesSummary).pipe(filter((entities) => entities.length > 0));

  fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    name: ["", [Validators.required, Validators.maxLength(80)]],
    description: [""],
    color: [RandomColorService.randomColorPicker(), Validators.required],
    workspaceId: ["", Validators.required],
  });

  constructor(private route: ActivatedRoute) {
    if (!this.workspaceService.entitiesSummary().length) {
      this.workspaceService.listRequest().then();
    }
    this.route.queryParamMap.pipe(combineLatestWith(this.$entities)).subscribe(([paramMap]) => {
      const workspaceId = paramMap.get("workspaceId");
      if (workspaceId) {
        this.form.controls.workspaceId.setValue(workspaceId);
      }
    });

    this.form.valueChanges.subscribe((value) => {
      if (value.workspaceId) {
        this.selectedWorkspace.set(this.workspaceService.entityMapSummary()[value.workspaceId]);
      }
    });
  }

  async onSubmit() {
    this.form.reset(this.form.value);
    if (this.form.valid) {
      const project = await this.projectService.createRequest(this.form.getRawValue());
      this.router.navigateByUrl(`/workspace/${project.workspace.id}/project/${project.id}/kanban/main`).then();
    }
  }
}
