import { Component, Directive, ElementRef, inject, OnInit, output, ViewContainerRef, signal } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatListItem, MatListItemIcon, MatListItemMeta, MatList } from "@angular/material/list";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: "app-resize-button-component",
  standalone: true,
  imports: [MatIcon, MatList, MatListItem, MatListItemIcon, MatListItemMeta, TranslocoDirective],
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
      const navList = document.querySelector<HTMLElement>(".mat-mdc-nav-list");
      this.resized.emit(resized);
      if (!navContainer || !contentContainer || !navList) {
        return;
      }
      if (resized) {
        const newWidth =
          parseFloat(
            getComputedStyle(navList).getPropertyValue("--mat-list-list-item-leading-icon-start-space").split("px")[0],
          ) *
            2 +
          24;
        contentContainer.style.marginLeft = `${newWidth}px`;
        navContainer.style.width = `${newWidth}px`;
      } else {
        contentContainer.style.marginLeft = "250px";
        navContainer.style.width = "250px";
      }
    });
  }
}
