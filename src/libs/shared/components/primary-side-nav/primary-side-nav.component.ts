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

import { ChangeDetectionStrategy, Component, inject, OnDestroy } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from "@angular/material/sidenav";
import { ResizeSideNavDirective } from "@tenzu/directives/side-nav";
import { MatListItem, MatListItemIcon, MatNavList } from "@angular/material/list";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { MatDivider } from "@angular/material/divider";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { NgComponentOutlet, TitleCasePipe, UpperCasePipe } from "@angular/common";
import { SideNavStore } from "@tenzu/data/sidenav";
import { TranslocoDirective } from "@jsverse/transloco";
import { SidenavListWorkflowComponent } from "../../../../app/workspace/project-detail/sidenav-list-workflow/sidenav-list-workflow.component";

@Component({
  selector: "app-primary-side-nav",
  imports: [
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    MatIcon,
    ResizeSideNavDirective,
    MatNavList,
    MatListItem,
    MatListItemIcon,
    RouterLinkActive,
    RouterLink,
    MatDivider,
    AvatarComponent,
    UpperCasePipe,
    TitleCasePipe,
    TranslocoDirective,
    NgComponentOutlet,
  ],
  template: `
    <mat-sidenav-container *transloco="let t">
      <mat-sidenav #sidenav mode="side" opened>
        <div class="flex flex-col justify-stretch h-full">
          @if (sideNavStore.avatar(); as avatar) {
            <div class="flex flex-row gap-2 p-2">
              <app-avatar
                [color]="avatar.color"
                [name]="avatar.name"
                [size]="sideNavStore.resized() ? 'md' : 'lg'"
              ></app-avatar>
              @if (!sideNavStore.resized()) {
                <div class="flex flex-col ">
                  <div class="mat-label-small text-on-surface-variant">{{ t(avatar.type) | uppercase }} /</div>
                  <div class="text-sm line-clamp-2 leading-4">{{ avatar.name | titlecase }}</div>
                </div>
              }
            </div>
          }
          @for (item of sideNavStore.primaryNavItems(); track item.href) {
            @if (item.componentConfig?.componentRef) {
              <ng-container
                *ngComponentOutlet="components[item.componentConfig!.componentRef]; inputs: item.componentConfig!.data"
              ></ng-container>
            }
          }
          <mat-nav-list class="grow" attr.aria-label="{{ t('component.primary_side_nav.main_nav') }}">
            @for (item of sideNavStore.primaryNavItems(); track item.href) {
              @if (!item.componentConfig?.componentRef) {
                @if (!sideNavStore.resized()) {
                  <a
                    mat-list-item
                    href="#"
                    [routerLink]="item.href"
                    routerLinkActive
                    #routerLinkActive="routerLinkActive"
                    [activated]="routerLinkActive.isActive"
                    attr.data-testid="{{ item.testId }}"
                    ><mat-icon matListItemIcon>{{ item.iconName }}</mat-icon>
                    {{ t(item.label) }}
                  </a>
                } @else {
                  <a
                    class="resized"
                    mat-list-item
                    href="#"
                    [routerLink]="item.href"
                    routerLinkActive
                    #routerLinkActive="routerLinkActive"
                    [activated]="routerLinkActive.isActive"
                    attr.data-testid="{{ item.testId }}"
                    ><mat-icon class="pt-1">{{ item.iconName }}</mat-icon>
                  </a>
                }
              }
            }
          </mat-nav-list>
          <div class="flex flex-col gap-y-2" appResizeSideNav (resized)="sideNavStore.setResized($event)">
            <mat-divider></mat-divider>
            <mat-nav-list attr.aria-label="{{ t('component.primary_side_nav.secondary_nav') }}">
              @for (item of sideNavStore.secondaryNavItems(); track item.href) {
                @if (!sideNavStore.resized()) {
                  <a
                    mat-list-item
                    href="#"
                    [routerLink]="item.href"
                    routerLinkActive
                    #routerLinkActive="routerLinkActive"
                    [activated]="routerLinkActive.isActive"
                    attr.data-testid="{{ item.testId }}"
                    ><mat-icon matListItemIcon>{{ item.iconName }}</mat-icon>
                    {{ t(item.label) }}
                  </a>
                } @else {
                  <a
                    class="resized"
                    mat-list-item
                    href="#"
                    [routerLink]="item.href"
                    routerLinkActive
                    #routerLinkActive="routerLinkActive"
                    [activated]="routerLinkActive.isActive"
                    attr.data-testid="{{ item.testId }}"
                    ><mat-icon class="pt-1">{{ item.iconName }}</mat-icon>
                  </a>
                }
              }
            </mat-nav-list>
            <mat-divider></mat-divider>
          </div>
        </div>
      </mat-sidenav>
      <mat-sidenav-content>
        <ng-content></ng-content>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrimarySideNavComponent implements OnDestroy {
  sideNavStore = inject(SideNavStore);
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  components: Record<string, any> = {
    SidenavListWorkflowComponent: SidenavListWorkflowComponent,
  };
  ngOnDestroy() {
    this.sideNavStore.reset();
  }
}
