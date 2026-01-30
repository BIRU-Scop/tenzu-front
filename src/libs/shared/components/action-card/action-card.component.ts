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

import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { AvatarComponent } from "../avatar/avatar.component";
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { ButtonComponent } from "@tenzu/shared/components/ui/button/button.component";

@Component({
  selector: "app-action-card",
  imports: [AvatarComponent, MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions, ButtonComponent],
  template: `
    <mat-card appearance="outlined" class="min-h-[100px] w-[200px] h-[100px] flex flex-col">
      <mat-card-header>
        <app-avatar mat-card-avatar [name]="name()" [color]="color()" />
        <mat-card-title>
          {{ name() }}
        </mat-card-title>
        <app-button
          [translocoKey]="cancelLabel()"
          [iconOnly]="true"
          level="error"
          (click)="canceled.emit()"
          iconName="block"
        />
      </mat-card-header>
      <mat-card-content class="flex-1"> </mat-card-content>
      <mat-card-actions class="mx-auto">
        <app-button [translocoKey]="submitLabel()" level="primary" (click)="submitted.emit()" iconName="check" />
      </mat-card-actions>
    </mat-card>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionCardComponent {
  name = input("");
  color = input(0);
  cancelLabel = input("");
  submitLabel = input("");
  canceled = output<void>();
  submitted = output<void>();
}
