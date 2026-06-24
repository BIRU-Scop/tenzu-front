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

import { Component, computed, effect, inject, signal } from "@angular/core";
import { MatDialogClose, MatDialogContent } from "@angular/material/dialog";
import { MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { TranslocoDirective } from "@jsverse/transloco";
import { FeedItemCardComponent } from "../feed-item-card/feed-item-card.component";
import { FeedItem, FeedRepositoryService } from "@tenzu/repository/feed";
import { TypedDialog } from "@tenzu/utils/services/typed-dialog-service/typed-dialog.service";
import { ButtonCloseComponent } from "@tenzu/shared/components/ui/button/button-close.component";

@Component({
  selector: "app-feed-dialog",
  imports: [
    MatDialogContent,
    MatDialogClose,
    MatIconButton,
    MatIcon,
    TranslocoDirective,
    FeedItemCardComponent,
    ButtonCloseComponent,
  ],
  template: `
    <ng-container *transloco="let t">
      <div class="flex flex-row p-4">
        <div class="content-center grow text-center">
          {{ t(dialogTitle()) }}
        </div>
        <app-button-close [iconNoBackground]="true" [iconOnly]="true" mat-dialog-close />
      </div>

      <mat-dialog-content>
        @let _activeFeed = activeFeed();
        @let _sortedEntities = sortedEntities();
        @if (_activeFeed) {
          <div class="flex items-center gap-2 py-2">
            @if (_sortedEntities.length > 1) {
              <button
                mat-icon-button
                [disabled]="activeIndex() === 0"
                [attr.aria-label]="t('feed.dialog.previous')"
                (click)="previous()"
              >
                <mat-icon>chevron_left</mat-icon>
              </button>
            }

            <app-feed-item-card class="flex-1" [feeditem]="_activeFeed" />

            @if (_sortedEntities.length > 1) {
              <button
                mat-icon-button
                [disabled]="activeIndex() === _sortedEntities.length - 1"
                [attr.aria-label]="t('feed.dialog.next')"
                (click)="next()"
              >
                <mat-icon>chevron_right</mat-icon>
              </button>
            }
          </div>

          @if (_sortedEntities.length > 1) {
            <div class="flex justify-center gap-2 pb-2 pt-4">
              @for (slide of _sortedEntities; track slide.id; let i = $index) {
                <button
                  class="h-2 w-2 rounded-full transition-colors"
                  [class.bg-primary]="i === activeIndex()"
                  [class.bg-outline-variant]="i !== activeIndex()"
                  [attr.aria-label]="t('feed.dialog.go_to', { number: i + 1 })"
                  [attr.aria-current]="i === activeIndex() ? 'true' : null"
                  (click)="goTo(i)"
                ></button>
              }
            </div>
          }
        }
      </mat-dialog-content>
    </ng-container>
  `,
})
export class FeedDialog extends TypedDialog<void, void> {
  private readonly repository = inject(FeedRepositoryService);

  protected readonly sortedEntities = this.repository.sortedEntities;
  protected readonly activeIndex = signal(0);
  protected readonly activeFeed = computed(() => this.sortedEntities()[this.activeIndex()]);
  private readonly titleByType: Record<FeedItem["type"], string> = {
    maintenance: "feed.dialog.title_maintenance",
    release: "feed.dialog.title_release",
    callToAction: "feed.dialog.title_call_to_action",
  };
  protected readonly dialogTitle = computed(() => {
    const type = this.activeFeed()?.type;
    return type ? this.titleByType[type] : "";
  });

  constructor() {
    super();
    effect(() => {
      const feed = this.activeFeed();
      if (feed && !feed.readAt) {
        this.repository.markRead({ ids: [feed.id] }).then();
      }
    });
  }

  previous(): void {
    this.activeIndex.update((index) => Math.max(0, index - 1));
  }

  next(): void {
    this.activeIndex.update((index) => Math.min(this.sortedEntities().length - 1, index + 1));
  }

  goTo(index: number): void {
    this.activeIndex.set(index);
  }
}
