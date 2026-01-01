/*
 * Copyright (C) 2024-2025 BIRU
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

import { ChangeDetectionStrategy, Component } from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatAnchor, MatButton } from "@angular/material/button";
import { RouterLink } from "@angular/router";
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: "app-page404",
  imports: [TranslocoDirective, RouterLink, MatAnchor, NgOptimizedImage, MatButton],
  template: `
    <main
      class="h-[100vh] flex flex-col items-center justify-center gap-4"
      *transloco="let t; prefix: 'errorPages.404'"
    >
      <img ngSrc="fun-ovni-sheep-animated.webp" width="237" height="328" alt="{{ t('image_description') }}" />
      <div class="text-center">
        <p>{{ t("title") }}</p>
        <p>{{ t("text") }}</p>
      </div>
      <a class="primary-button" mat-flat-button [routerLink]="'/'">{{ t("call_for_action") }}</a>
    </main>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Page404Component {}
