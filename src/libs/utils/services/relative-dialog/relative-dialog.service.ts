/*
 * Copyright (C) 2024 BIRU
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

import { inject, Injectable } from "@angular/core";
import { MatDialog, MatDialogConfig, MatDialogRef } from "@angular/material/dialog";
import { ComponentType, NoopScrollStrategy } from "@angular/cdk/overlay";
import { fromEvent, map, take } from "rxjs";

type Config = MatDialogConfig & {
  relativeXPosition?: "left" | "center" | "right" | "auto";
  relativeYPosition?: "above" | "below" | "auto";
};
/**
 * This service create a modal positioned relatively to its trigger button
 */

const calculateHorizontalAutoPosition = (right: number) => {
  if (right < window.innerWidth * 0.25) {
    return "right";
  }
  if (right >= window.innerWidth * 0.25 && right <= window.innerWidth * 0.75) {
    return "center";
  }
  return "left";
};

const calculateVerticalAutoPosition = (bottom: number) => {
  if (bottom < window.innerHeight * 0.5) {
    return "below";
  }
  return "above";
};

@Injectable({
  providedIn: "root",
})
export class RelativeDialogService {
  readonly dialog = inject(MatDialog);
  private windowScroll$ = fromEvent(window, "scroll").pipe(
    map(() => window.scrollY),
    take(1),
  );

  public open<T>(template: ComponentType<T>, target?: EventTarget | null, config?: Config): MatDialogRef<T> {
    const buttonElem = target ? (target as HTMLElement).closest("button") : null;
    if (!buttonElem) {
      return this.dialog.open(template, {
        ...config,
      });
    }
    const { top, bottom, left, right } = buttonElem.getBoundingClientRect();
    // eslint-disable-next-line prefer-const
    let { relativeXPosition = "center", relativeYPosition = "below", ...restConfig } = config || {};
    if (relativeXPosition === "auto") {
      relativeXPosition = calculateHorizontalAutoPosition(right);
    }
    if (relativeYPosition === "auto") {
      relativeYPosition = calculateVerticalAutoPosition(bottom);
    }
    const relativeDialogRef = this.dialog.open(template, {
      ...restConfig,
      position: {
        left: `${(left + right) / 2}px`,
        top: `${relativeYPosition === "below" ? bottom : top}px`,
      },
      backdropClass: "cdk-overlay-transparent-backdrop",
      panelClass: [`aligned-${relativeXPosition}-to-anchor`, `${relativeYPosition}-anchor`],
      // avoid scroll jumps back after dialog close
      scrollStrategy: new NoopScrollStrategy(),
      restoreFocus: false,
    });
    // close the dialog when user start to scroll
    this.windowScroll$.subscribe(() => relativeDialogRef.close());
    // restore focus on trigger button
    relativeDialogRef.afterClosed().subscribe(() => buttonElem.focus());
    return relativeDialogRef;
  }
}
