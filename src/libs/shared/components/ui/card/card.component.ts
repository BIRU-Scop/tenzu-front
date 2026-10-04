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

import { Component, Directive, input } from "@angular/core";
import { AsyncPipe } from "@angular/common";
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { RouterLink } from "@angular/router";
import { AvatarComponent } from "@tenzu/shared/components/avatar/avatar.component";
import { GetBase64FromImageUrlPipe } from "@tenzu/pipes/get-base64-from-image-url.pipe";

@Directive({
  selector: "app-card-backdrop, [appCardBackdrop]",
})
export class CardBackdropDirective {}

@Directive({
  selector: "app-card-header-action, [appCardHeaderAction]",
})
export class CardHeaderActionDirective {}

@Component({
  selector: "app-card",
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    AvatarComponent,
    RouterLink,
    AsyncPipe,
    GetBase64FromImageUrlPipe,
  ],
  template: `
    @let _name = name();
    @let _landingPage = landingPage();
    @let _backdrop = backdrop();
    <mat-card
      appearance="outlined"
      class="min-h-[120px] w-[200px] mat-bg-surface-container-high"
      [class.mat-card-error]="error()"
    >
      @if (_backdrop) {
        <div
          class="z-50 h-full w-full backdrop-blur-sm rounded-lg flex flex-col items-center justify-center absolute text-center"
        >
          <ng-content select="app-card-backdrop, [appCardBackdrop]"></ng-content>
        </div>
      }
      @if (_name) {
        <mat-card-header [aria-hidden]="_backdrop">
          <app-avatar
            mat-card-avatar
            mode="filled-square"
            [name]="_name"
            [color]="color()"
            [imageData]="logo() | getBase64FromImageUrl: 'small' | async"
          />
          <mat-card-title class="!contents min-h-[40px]">
            @if (_landingPage) {
              <a [routerLink]="_landingPage">{{ _name }}</a>
            } @else {
              {{ _name }}
            }
          </mat-card-title>
          <ng-content select="app-card-header-action, [appCardHeaderAction]"></ng-content>
        </mat-card-header>
      }
      <mat-card-content [aria-hidden]="_backdrop">
        <div class="pt-2 flex flex-col gap-1 min-h-[3lh]">
          <ng-content>
            <p class="pl-2">{{ description() }}</p>
          </ng-content>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: ``,
})
export class CardComponent {
  name = input<string>("");
  color = input<number>(0);
  logo = input<string | null | undefined>(undefined);
  description = input<string | null>("");
  landingPage = input<string | null>(null);
  error = input<boolean>(false);
  backdrop = input<boolean>(false);
}
