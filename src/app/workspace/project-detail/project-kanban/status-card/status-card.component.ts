import { ChangeDetectionStrategy, Component, inject, input, output } from "@angular/core";
import { MatCard, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { TranslocoDirective } from "@jsverse/transloco";
import {
  EnterNameDialogComponent,
  NameDialogData,
} from "@tenzu/shared/components/enter-name-dialog/enter-name-dialog.component";
import { matDialogConfig } from "@tenzu/utils";
import { RelativeDialogService } from "@tenzu/utils/services";
import { ProjectKanbanService } from "../project-kanban.service";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatDialog } from "@angular/material/dialog";
import { DeleteStatusDialogComponent } from "./delete-status-dialog/delete-status-dialog.component";
import { Validators } from "@angular/forms";

@Component({
  selector: "app-status-card",
  standalone: true,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatIcon,
    TranslocoDirective,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
  ],
  template: `
    <mat-card appearance="outlined" class="heading-card" *transloco="let t; prefix: 'workflow'">
      <mat-card-header>
        <mat-card-title class="whitespace-nowrap truncate">
          {{ name() }}
        </mat-card-title>
        <button mat-icon-button attr.aria-label="{{ t('edit_status.aria_label') }}" [matMenuTriggerFor]="menu">
          <mat-icon>more_vert</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          @if (config().showLeft) {
            <button mat-menu-item (click)="moveLeft()">
              <mat-icon>arrow_back</mat-icon>
              {{ t("edit_status.move_left") }}
            </button>
          }
          @if (config().showRight) {
            <button mat-menu-item (click)="moveRight()">
              <mat-icon>arrow_forward</mat-icon>
              {{ t("edit_status.move_right") }}
            </button>
          }
          <button mat-menu-item (click)="openEditStatus($event)">
            <mat-icon>edit</mat-icon>{{ t("edit_status.edit_name") }}
          </button>
          <button mat-menu-item (click)="onDelete()"><mat-icon>delete</mat-icon>{{ t("edit_status.delete") }}</button>
        </mat-menu>
      </mat-card-header>
    </mat-card>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "w-full",
  },
})
export class StatusCardComponent {
  name = input("");
  id = input("");
  isEmpty = input(false);
  config = input<{ showLeft: boolean; showRight: boolean }>({ showLeft: true, showRight: true });
  movedRight = output<boolean>();
  movedLeft = output<boolean>();
  projectKanbanService = inject(ProjectKanbanService);
  dialog = inject(MatDialog);
  relativeDialog = inject(RelativeDialogService);

  openEditStatus(event: MouseEvent): void {
    const data: NameDialogData = {
      label: "workflow.edit_status_name.status_name",
      action: "workflow.edit_status_name.edit_status_name",
      defaultValue: this.name(),
      validators: [
        {
          type: "required",
          message: "workflow.edit_status_name.name_required",
          validatorFn: Validators.required,
        },
        {
          type: "maxLength",
          message: "form_errors.max_length",
          translocoParams: { length: 30 },
          validatorFn: Validators.maxLength(30),
        },
      ],
    };
    const dialogRef = this.relativeDialog.open(EnterNameDialogComponent, event?.target, {
      ...matDialogConfig,
      relativeXPosition: "left",
      data: data,
    });
    dialogRef.afterClosed().subscribe((name?: string) => {
      if (name) {
        this.projectKanbanService.editStatus({ name, id: this.id() });
      }
    });
  }

  onDelete() {
    if (this.isEmpty()) {
      this.projectKanbanService.deleteStatus(this.id());
    } else {
      this.openDeleteDialog();
    }
  }
  moveLeft() {
    this.movedLeft.emit(true);
  }
  moveRight() {
    this.movedRight.emit(true);
  }
  openDeleteDialog() {
    const dialogRef = this.dialog.open(DeleteStatusDialogComponent, {
      ...matDialogConfig,
      data: {
        statusName: this.name(),
        statusId: this.id(),
      },
    });
    dialogRef.afterClosed().subscribe((formValue?: { stories: "delete" | "move"; status: string }) => {
      if (formValue) {
        const moveToStatus: string | undefined = formValue.stories === "move" ? formValue.status : undefined;
        this.projectKanbanService.deleteStatus(this.id(), moveToStatus);
      }
    });
  }
}
