import { inject, Injectable } from "@angular/core";
import { MatDialog, MatDialogConfig, MatDialogRef } from "@angular/material/dialog";
import { ComponentType, NoopScrollStrategy } from "@angular/cdk/overlay";
import { fromEvent, map, take } from "rxjs";

type Config = MatDialogConfig & {
  relativeXPosition?: "left" | "center" | "right";
  relativeYPosition?: "above" | "below";
};
/**
 * This service create a modal positioned relatively to its trigger button
 */
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
    const { relativeXPosition = "center", relativeYPosition = "below", ...restConfig } = config || {};
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
