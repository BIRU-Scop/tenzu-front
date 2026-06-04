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

import { Component, Directive, ElementRef, inject, OnInit, output, signal, ViewContainerRef } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatListItemIcon } from "@angular/material/list";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: "app-resize-button-component",
  imports: [MatIcon, MatListItemIcon, TranslocoDirective],
  template: `
    <button
      (click)="toggle()"
      class="my-2 flex flex-row gap-2 items-center nav-button w-full"
      [class.justify-end]="!_resized()"
      [class.justify-center]="_resized()"
      *transloco="let t; prefix: 'component.primary_side_nav'"
    >
      @if (!_resized()) {
        <span>{{ t("collapse") }}</span> <mat-icon matListItemIcon>left_panel_close</mat-icon>
      } @else {
        <mat-icon>left_panel_open</mat-icon>
      }
    </button>
  `,
})
class ResizeIconComponent {
  toggled = output<boolean>();
  _resized = signal(false);
  toggle() {
    this._resized.update((old) => !old);
    this.toggled.emit(this._resized());
  }
}

@Directive({
  selector: "[appResizeSideNav]",
  standalone: true,
})
export class ResizeSideNavDirective implements OnInit {
  el = inject(ElementRef);
  viewContainerRef = inject(ViewContainerRef);
  resized = output<boolean>();

  ngOnInit() {
    const resizeIconComponent = this.viewContainerRef.createComponent(ResizeIconComponent);
    resizeIconComponent.instance.toggled.subscribe((resized) => {
      const navContainer = document.querySelector<HTMLElement>(".mat-sidenav");
      const contentContainer = document.querySelector<HTMLElement>(".mat-sidenav-content");
      this.resized.emit(resized);
      if (!navContainer || !contentContainer) {
        return;
      }
      const rootStyles = getComputedStyle(document.body);
      const expanded = rootStyles.getPropertyValue("--tz-sidenav-width").trim() || "250px";
      const collapsed = rootStyles.getPropertyValue("--tz-sidenav-width-collapsed").trim() || "56px";
      const width = resized ? collapsed : expanded;
      contentContainer.style.marginLeft = width;
      navContainer.style.width = width;
    });
  }
}
