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

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { AvatarComponent } from "../avatar/avatar.component";
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { TranslocoDirective } from "@jsverse/transloco";
import { WorkspaceSummary } from "@tenzu/repository/workspace";

@Component({
  selector: "app-project-importation-card",
  imports: [AvatarComponent, MatCard, MatCardHeader, MatCardTitle, MatCardContent, TranslocoDirective],
  template: `
    @let _name = "Lorem Ipsum";
    @let _color = 3;
    @let _description = "Lorem Ipsum dolor sit amet";
    @let _workspaceId = workspaceId();
    <mat-card appearance="outlined" class="min-h-[100px] w-[200px]" *transloco="let t">
      <div class="z-50 h-full w-full backdrop-blur-sm flex items-center justify-center absolute">
        <!--        TODO real text-->
        <p>IMPORTATION</p>
      </div>
      <mat-card-header>
        <app-avatar mat-card-avatar [name]="_name" [color]="_color" />
        <mat-card-title class="!contents min-h-[40px]">{{ _name }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="pt-2 pl-2 flex flex-col gap-1">
          <p>
            {{ _description }}
          </p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectImportationCardComponent {
  workspaceId = input.required<WorkspaceSummary["id"]>();
}
