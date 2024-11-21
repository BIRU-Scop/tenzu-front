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

import { ChangeDetectionStrategy, Component } from "@angular/core";
import { BreadcrumbComponent } from "@tenzu/shared/components/breadcrumb";
import { PrimarySideNavComponent } from "@tenzu/shared/components/primary-side-nav";
import { RouterOutlet } from "@angular/router";

@Component({
    selector: "app-detail-base",
    imports: [BreadcrumbComponent, PrimarySideNavComponent, RouterOutlet],
    template: `
    <app-primary-side-nav>
      <app-breadcrumb></app-breadcrumb>
      <div class="mt-10"><router-outlet /></div>
    </app-primary-side-nav>
  `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailBaseComponent {}
