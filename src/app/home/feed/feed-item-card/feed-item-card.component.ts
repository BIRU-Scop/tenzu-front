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

import { Component, computed, input, output } from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import { marked } from "marked";
import { SafeHtmlPipe } from "@tenzu/pipes/safe-html.pipe";
import { FeedItem } from "@tenzu/repository/feed";
import { NgOptimizedImage } from "@angular/common";
import { MatButton } from "@angular/material/button";

@Component({
  selector: "app-feed-item-card",
  imports: [TranslocoDirective, SafeHtmlPipe, NgOptimizedImage, MatButton],
  template: `
    @let _feed = feeditem();
    <article *transloco="let t" class="flex gap-6">
      <img class="w-44 h-44 shrink-0 self-center object-contain" [ngSrc]="imageUrl()" width="176" height="176" alt="" />
      <div class="flex flex-1 flex-col gap-3">
        <h3 class="mat-headline-small">{{ _feed.title }}</h3>
        <div class="flex-1 mat-body-large" [innerHTML]="renderedContent() | safeHtml"></div>
        @if (hasAction()) {
          <a
            class="self-start inline-flex items-center gap-1 rounded-lg border px-4 py-2 font-semibold tertiary-button"
            mat-stroked-button
            [href]="_feed.actionUrl"
            target="_blank"
            (click)="actionClicked.emit(_feed)"
          >
            {{ _feed.actionTitle }}
            <span class="sr-only">{{ t("feed.action.new_tab") }}</span>
          </a>
        }
      </div>
    </article>
  `,
})
export class FeedItemCardComponent {
  feeditem = input.required<FeedItem>();
  actionClicked = output<FeedItem>();

  protected readonly hasAction = computed(() => this.feeditem().actionUrl.length > 0);
  protected readonly renderedContent = computed(
    () => marked.parse(this.feeditem().content, { async: false }) as string,
  );

  private readonly imageByType: Record<FeedItem["type"], string> = {
    maintenance: "feeds_maintenance.svg",
    release: "feeds_release.svg",
    callToAction: "feeds_cta.svg",
  };
  protected readonly imageUrl = computed(() => this.imageByType[this.feeditem().type]);
}
