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
  selector: "[appCardBackdropHeader]",
  host: { class: "flex flex-col items-center w-full min-w-0" },
})
export class CardBackdropHeaderDirective {}

@Directive({
  selector: "[appCardBackdropTitle]",
  host: { class: "mat-title-small" },
})
export class CardBackdropTitleDirective {}

@Directive({
  selector: "[appCardBackdropSubtitle]",
  host: { class: "mat-body-small !leading-tight break-words" },
})
export class CardBackdropSubtitleDirective {}

@Directive({
  selector: "[appCardBackdropContent]",
  host: { class: "flex flex-row items-center w-full" },
})
export class CardBackdropContentDirective {}

@Directive({
  selector: "[appCardBackdropActions]",
  host: { class: "flex flex-row justify-center gap-2 w-full" },
})
export class CardBackdropActionsDirective {}

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
      class="!grid grid-cols-[minmax(0,1fr)] min-h-[152px] w-[240px] mat-bg-surface-container-high"
      [class.mat-card-error]="error()"
    >
      @if (_backdrop) {
        <div
          class="app-card-backdrop z-50 [grid-area:1/1] grid grid-cols-[minmax(0,1fr)] grid-rows-[1fr_auto_1fr] justify-items-center text-center px-3 pt-2 pb-2.5"
        >
          <div class="self-start w-full">
            <ng-content select="[appCardBackdropHeader]"></ng-content>
          </div>
          <div class="self-center w-full flex flex-col items-center">
            <ng-content select="[appCardBackdropContent]"></ng-content>
            <ng-content select="app-card-backdrop, [appCardBackdrop]"></ng-content>
          </div>
          <div class="self-center w-full">
            <ng-content select="[appCardBackdropActions]"></ng-content>
          </div>
        </div>
      }
      <div class="[grid-area:1/1] flex flex-col min-w-0 overflow-hidden">
        @if (_name) {
          <mat-card-header [aria-hidden]="_backdrop">
            @if (_backdrop) {
              <div mat-card-avatar class="skeleton-image w-8 h-8 shrink-0"></div>
            } @else {
              <app-avatar
                mat-card-avatar
                class="shrink-0"
                mode="filled-square"
                [name]="_name"
                [color]="color()"
                [imageData]="logo() | getBase64FromImageUrl: 'small' | async"
              />
            }
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
      </div>
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
