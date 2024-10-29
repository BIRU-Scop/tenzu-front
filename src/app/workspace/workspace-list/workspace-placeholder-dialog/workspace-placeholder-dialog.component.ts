import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from "@angular/material/dialog";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: "app-workspace-placeholder-dialog",
  standalone: true,
  imports: [MatDialogContent, MatDialogActions, MatDialogTitle, MatDialogClose, MatButton, TranslocoDirective],
  template: `
    <ng-container *transloco="let t; prefix: 'workspace'">
      <h2 id="aria-label" mat-dialog-title>{{ t("placeholder.placeholder_title") }}</h2>
      <mat-dialog-content
        ><p>{{ t("placeholder.placeholder_text") }}</p>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-flat-button mat-dialog-close class="primary-button">{{ t("create.create_workspace") }}</button>
      </mat-dialog-actions>
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspacePlaceholderDialogComponent {}
