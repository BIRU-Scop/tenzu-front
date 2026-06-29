/*
 * Copyright (C) 2026 BIRU
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

import { effect, inject, Injectable, signal } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { FeedDialog } from "./feed-dialog/feed-dialog";
import { FeedRepositoryService } from "@tenzu/repository/feed";
import { TypedDialog, TypedDialogService } from "@tenzu/utils/services/typed-dialog-service/typed-dialog.service";
import { matDialogConfig } from "@tenzu/utils/mat-config";

@Injectable({
  providedIn: "root",
})
export class FeedOrchestratorService {
  private readonly repository = inject(FeedRepositoryService);
  private readonly dialog = inject(TypedDialogService);

  readonly unreadCount = this.repository.unreadCount;

  private dialogRef: MatDialogRef<TypedDialog<void, void>, void> | null = null;
  private alreadyAutoOpened = signal(false);
  private openPending = false;

  constructor() {
    effect(() => {
      const unreadCount = this.repository.unreadCount();
      const hasItems = this.repository.sortedEntities().length > 0;
      if (unreadCount > 0 && !this.alreadyAutoOpened()) {
        this.openModal();
      }
      if (hasItems) {
        this.alreadyAutoOpened.set(true);
      }
    });
  }

  async init() {
    return this.repository.listRequest();
  }

  openModal(): void {
    const hasMaintenance = this.repository.hasMaintenance();
    if (this.dialogRef || this.openPending) {
      return;
    }
    this.openPending = true;
    this.dialog
      .openWhenIdle<void, void>(FeedDialog, {
        ...matDialogConfig,
        role: hasMaintenance ? "alertdialog" : "dialog",
        width: "560px",
        maxWidth: "90vw",
      })
      .subscribe((dialogRef) => {
        this.openPending = false;
        this.dialogRef = dialogRef;
        dialogRef.afterClosed().subscribe(() => (this.dialogRef = null));
      });
  }
}
