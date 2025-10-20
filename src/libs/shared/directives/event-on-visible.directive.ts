/*
 * Copyright (C) 2025 BIRU
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

import { AfterViewInit, Directive, ElementRef, inject, input, OnDestroy, OnInit, output } from "@angular/core";
import { delay, Subject } from "rxjs";
import { filter } from "rxjs/operators";

@Directive({
  selector: "[appEventOnVisible]",
})
export class EventOnVisibleDirective implements OnDestroy, OnInit, AfterViewInit {
  debounceTime = input(0);
  threshold = input(1);
  visible = output();
  private el = inject(ElementRef);

  private observer: IntersectionObserver | undefined;
  private subject$ = new Subject<{
    entry: IntersectionObserverEntry;
    observer: IntersectionObserver;
  }>();

  ngOnInit() {
    this.createObserver();
  }

  ngAfterViewInit() {
    this.startObservingElements();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }

    this.subject$.complete();
  }

  private createObserver() {
    const options = {
      rootMargin: "0px",
      threshold: this.threshold(),
    };
    const isIntersecting = (entry: IntersectionObserverEntry) => entry.isIntersecting || entry.intersectionRatio > 0;

    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (isIntersecting(entry)) {
          this.subject$.next({ entry, observer });
        }
      });
    }, options);
  }

  private startObservingElements() {
    if (!this.observer) {
      return;
    }

    this.observer.observe(this.el.nativeElement);

    this.subject$.pipe(delay(this.debounceTime()), filter(Boolean)).subscribe(async ({ entry, observer }) => {
      const target = entry.target as HTMLElement;
      this.visible.emit();
      observer.unobserve(target);
    });
  }
}
