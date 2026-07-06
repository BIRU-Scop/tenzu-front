/*
 * Copyright (C) 2024-2026 BIRU
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

import { Component } from "@angular/core";
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from "@angular/material/dialog";
import { TranslocoDirective } from "@jsverse/transloco";
import {
  FormFooterComponent,
  FormFooterSecondaryActionDirective,
} from "@tenzu/shared/components/ui/form-footer/form-footer.component";
import { ButtonCancelComponent } from "@tenzu/shared/components/ui/button/button-cancel.component";
import { ButtonAddComponent } from "@tenzu/shared/components/ui/button/button-add.component";

@Component({
  selector: "app-workspace-placeholder-dialog",
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogTitle,
    MatDialogClose,
    TranslocoDirective,
    FormFooterComponent,
    ButtonCancelComponent,
    FormFooterSecondaryActionDirective,
    ButtonAddComponent,
  ],
  template: `
    <ng-container *transloco="let t; prefix: 'workspace'">
      <h2 id="aria-label" mat-dialog-title>{{ t("placeholder.placeholder_title") }}</h2>
      <mat-dialog-content
        ><p>{{ t("placeholder.placeholder_text") }}</p>
      </mat-dialog-content>
      <mat-dialog-actions>
        <app-form-footer>
          <app-button-cancel appFormFooterSecondaryAction mat-dialog-close />
          <app-button-add [mat-dialog-close]="true" translocoKey="workspace.create.create_workspace" cdkFocusInitial />
        </app-form-footer>
      </mat-dialog-actions>
    </ng-container>
  `,
  styles: ``,
})
export class WorkspacePlaceholderDialogComponent {}
