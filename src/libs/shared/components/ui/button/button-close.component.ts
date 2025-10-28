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

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { ButtonComponent } from "./button.component";
import { IconName, LevelType, ButtonType } from "../ui.types";
import { ButtonInterface } from "./button.interface";
import { MatButtonAppearance } from "@angular/material/button";

@Component({
  selector: "app-button-close",
  imports: [ButtonComponent],
  templateUrl: "./button-base.component.html",
  host: {
    class: "inline-block",
  },
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonCloseComponent implements ButtonInterface {
  level = input<LevelType>("secondary");
  appearance = input<MatButtonAppearance>("filled");
  translocoKey = input<string>("commons.close");
  iconName = input<IconName | undefined>("close");
  iconOnly = input<boolean>(false);
  disabled = input<boolean>(false);
  type = input<ButtonType>("button");
}
