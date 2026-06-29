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

import { Component, computed, inject, signal, TemplateRef, viewChild } from "@angular/core";
import { Dialog } from "@angular/cdk/dialog";
import { Overlay } from "@angular/cdk/overlay";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { DomainMockStore } from "./mock-state";
import { MatCard, MatCardActions, MatCardContent } from "@angular/material/card";
import { MatBadgeModule } from "@angular/material/badge";

@Component({
  selector: "app-mock-control-panel",
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatBadgeModule,
  ],
  template: `
    <button
      class="!fixed bottom-4 right-4 z-50"
      mat-fab
      matBadge="!"
      [matBadgeHidden]="!dirty()"
      [class.grayscale]="!mockStore.anyDomainMocked()"
      [class.opacity-60]="!mockStore.anyDomainMocked()"
      (click)="open()"
    >
      <mat-icon fontSet="material-symbols-rounded">construction</mat-icon>
    </button>

    <ng-template #panel>
      <mat-card class="max-h-[70vh] min-w-4 overflow-y-auto">
        <mat-card-content>
          @for (row of rows(); track row.name) {
            <div
              class="flex items-center justify-between gap-4"
              [attr.data-testid]="row.pending ? 'mockRowPending' : null"
              [class.opacity-60]="row.pending"
              [class.italic]="row.pending"
            >
              <mat-slide-toggle [checked]="row.enabled" (change)="toggleDomain(row.name, $event.checked)">
                {{ row.name }}
              </mat-slide-toggle>
              <span class="uppercase ">
                {{ row.source }}
              </span>
            </div>
          }
        </mat-card-content>
        <mat-card-actions class="flex justify-between gap-2">
          <button matButton="filled" class="secondary-button" [disabled]="rows().length === 0" (click)="enableAll()">
            Enable all
          </button>
          <button matButton="filled" class="secondary-button" [disabled]="rows().length === 0" (click)="resetAll()">
            Disable all (reset)
          </button>
          @if (dirty()) {
            <button matIconButton (click)="reload()"><mat-icon>refresh</mat-icon></button>
          }
        </mat-card-actions>
      </mat-card>
    </ng-template>
  `,
})
export class MockControlPanelComponent {
  protected readonly mockStore = inject(DomainMockStore);
  private readonly pendingNames = signal<ReadonlySet<string>>(new Set());

  protected readonly dirty = computed(() => this.pendingNames().size > 0);
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>("panel");
  private readonly dialog = inject(Dialog);
  private readonly overlay = inject(Overlay);

  protected readonly rows = computed(() => {
    const pending = this.pendingNames();
    return this.mockStore.domainMock().map((domain) => ({
      ...domain,
      pending: pending.has(domain.name),
    }));
  });

  open(): void {
    const positionStrategy = this.overlay.position().global().right("1rem").bottom("5.5rem");
    this.dialog.open(this.panelTemplate(), {
      positionStrategy,
      hasBackdrop: true,
      backdropClass: "cdk-overlay-transparent-backdrop",
    });
  }

  toggleDomain(name: string, enabled: boolean): void {
    this.mockStore.enableDomainMock(name, enabled);
    this.pendingNames.update((names) => new Set(names).add(name));
  }

  enableAll(): void {
    this.mockStore.enableGlobal(true);
    this.markAllPending();
  }

  resetAll(): void {
    this.mockStore.reset();
    this.markAllPending();
  }

  reload(): void {
    location.reload();
  }

  private markAllPending(): void {
    this.pendingNames.set(new Set(this.mockStore.domaineNames()));
  }
}
