/*
 * Copyright (C) 2025 BIRU
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

import { Directive, inject, Injectable } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from "@angular/material/dialog";
import { ComponentType } from "@angular/cdk/overlay";

@Directive()
export abstract class TypedDialog<DialogData, DialogResult> {
  protected data: DialogData = inject(MAT_DIALOG_DATA);
  protected dialogRef: MatDialogRef<TypedDialog<DialogData, DialogResult>, DialogResult> = inject(MatDialogRef);
}

@Injectable({ providedIn: "root" })
export class TypedDialogService {
  protected dialog = inject(MatDialog);

  open<DialogData, DialogResult>(
    component: ComponentType<TypedDialog<DialogData, DialogResult>>,
    config?: MatDialogConfig<DialogData>,
  ): MatDialogRef<TypedDialog<DialogData, DialogResult>, DialogResult> {
    return this.dialog.open(component, config);
  }
}
