import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { WorkspaceSkeletonComponent } from "./workspace-skeleton/workspace-skeleton.component";
import { WorkspaceCardComponent } from "./workspace-card/workspace-card.component";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatDialog } from "@angular/material/dialog";
import { animate, query, stagger, style, transition, trigger } from "@angular/animations";

import { WorkspacePlaceholderDialogComponent } from "./workspace-placeholder-dialog/workspace-placeholder-dialog.component";
import { matDialogConfig } from "@tenzu/utils";
import { ProjectCardComponent } from "@tenzu/shared/components/project-card/project-card.component";
import { CardSkeletonComponent } from "@tenzu/shared/components/skeletons/card-skeleton/card-skeleton.component";
import { WorkspaceStore } from "@tenzu/data/workspace";
import { RelativeDialogService } from "@tenzu/utils/services";
import {
  EnterNameDialogComponent,
  NameDialogData,
} from "@tenzu/shared/components/enter-name-dialog/enter-name-dialog.component";
import { Validators } from "@angular/forms";

@Component({
  selector: "app-workspace-list",
  standalone: true,
  imports: [
    WorkspaceCardComponent,
    MatIcon,
    MatButton,
    TranslocoDirective,
    ProjectCardComponent,
    WorkspaceSkeletonComponent,
    CardSkeletonComponent,
  ],
  template: `
    <div *transloco="let t; prefix: 'commons'" class="p-4 max-w-7xl mx-auto">
      <div class="flex flex-row">
        <h1 class="mat-headline-medium grow">{{ t("projects") }}</h1>
        <button
          (click)="openCreateDialog($event)"
          data-testid="create-workspace-open"
          class="tertiary-button"
          mat-stroked-button
        >
          <mat-icon>add</mat-icon>
          {{ t("workspace") }}
        </button>
      </div>
      @let workpaces = workspaceStore.entities();
      @if (workpaces.length > 0) {
        <ul [@newItemsFlyIn]="workpaces.length" class="flex flex-col gap-8">
          @for (workspace of workpaces; track workspace.id) {
            <li>
              <app-workspace-card
                [name]="workspace.name"
                [color]="workspace.color"
                [id]="workspace.id"
              ></app-workspace-card>
              <ul class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-4">
                @for (project of workspace.latestProjects; track project.id) {
                  <li>
                    <app-project-card
                      [workspaceId]="workspace.id"
                      [projectId]="project.id"
                      [name]="project.name"
                      [color]="project.color"
                      [description]="project.description ? project.description : null"
                    ></app-project-card>
                  </li>
                }
                @if (!workspace.latestProjects || workspace.latestProjects.length === 0) {
                  <li><app-project-card [workspaceId]="workspace.id"></app-project-card></li>
                }
              </ul>
            </li>
          }
        </ul>
      } @else {
        <ul class="flex flex-col gap-8">
          <li>
            <app-workspace-skeleton></app-workspace-skeleton>
            <ul class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-4">
              @for (skeleton of skeletons; track skeleton) {
                <li><app-card-skeleton></app-card-skeleton></li>
              }
            </ul>
          </li>
        </ul>
      }
    </div>
  `,
  animations: [
    trigger("newItemsFlyIn", [
      transition(":enter, * => 0, * => -1", []),
      transition(":increment", [
        query(
          ":enter",
          [
            style({ opacity: 0, height: 0 }),
            stagger(50, [animate("400ms ease-out", style({ opacity: 1, height: "*" }))]),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceListComponent {
  readonly workspaceStore = inject(WorkspaceStore);
  readonly relativeDialog = inject(RelativeDialogService);
  readonly dialog = inject(MatDialog);
  readonly skeletons = Array(6);

  private init = async () => {
    const workspaces = await this.workspaceStore.list();
    if (workspaces.length === 0) {
      this.openPlaceholderDialog();
    }
  };

  private openPlaceholderDialog = (event?: MouseEvent) => {
    const dialogRef = this.dialog.open(WorkspacePlaceholderDialogComponent, { ...matDialogConfig, disableClose: true });
    dialogRef.afterClosed().subscribe(() => {
      this.openCreateDialog(event);
    });
  };

  constructor() {
    this.init();
  }

  public openCreateDialog(event?: MouseEvent): void {
    const data: NameDialogData = {
      label: "workspace.create.workspace_name",
      action: "workspace.create.create_workspace",
      placeholder: "workspace.create.name_placeholder",
      validators: [
        {
          type: "required",
          message: "workspace.create.name_required",
          validatorFn: Validators.required,
        },
        {
          type: "maxLength",
          message: "form_errors.max_length",
          translocoParams: { length: 40 },
          validatorFn: Validators.maxLength(40),
        },
      ],
    };
    const dialogRef = this.relativeDialog.open(EnterNameDialogComponent, event?.target, {
      ...matDialogConfig,
      disableClose: this.workspaceStore.entities().length === 0,
      relativeXPosition: "left",
      id: "create-workspace",
      data: data,
    });

    dialogRef.afterClosed().subscribe(async (name?: string) => {
      if (name !== undefined) {
        const color = Math.floor(Math.random() * (8 - 1) + 1);
        await this.workspaceStore.create({
          name,
          color,
        });
      } else if (this.workspaceStore.entities().length === 0) {
        this.openPlaceholderDialog(event);
      }
    });
  }
}