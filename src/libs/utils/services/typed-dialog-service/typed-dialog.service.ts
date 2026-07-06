/*
 * Copyright (C) 2025-2026 BIRU
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
import { Observable, ReplaySubject } from "rxjs";
type ExtractComponentType<T> = T extends ComponentType<infer U> ? U : never;

@Directive()
export abstract class TypedDialog<DialogData, DialogResult> {
  protected data: DialogData = inject(MAT_DIALOG_DATA);
  protected dialogRef: MatDialogRef<TypedDialog<DialogData, DialogResult>, DialogResult> = inject(MatDialogRef);
}

@Injectable({ providedIn: "root" })
export class TypedDialogService {
  protected dialog = inject(MatDialog);

  private readonly queue: Array<() => void> = [];

  constructor() {
    this.dialog.afterAllClosed.subscribe(() => this.queue.shift()?.());
  }

  open<DialogData, DialogResult>(
    component: ComponentType<TypedDialog<DialogData, DialogResult>>,
    config?: MatDialogConfig<DialogData>,
  ): MatDialogRef<ExtractComponentType<typeof component>, DialogResult> {
    return this.dialog.open(component, config);
  }

  openWhenIdle<DialogData, DialogResult>(
    component: ComponentType<TypedDialog<DialogData, DialogResult>>,
    config?: MatDialogConfig<DialogData>,
  ): Observable<MatDialogRef<ExtractComponentType<typeof component>, DialogResult>> {
    const opened$ = new ReplaySubject<MatDialogRef<ExtractComponentType<typeof component>, DialogResult>>(1);
    const openTask = () => {
      opened$.next(this.open(component, config));
      opened$.complete();
    };
    if (this.dialog.openDialogs.length === 0 && this.queue.length === 0) {
      openTask();
    } else {
      this.queue.push(openTask);
    }
    return opened$.asObservable();
  }
}
