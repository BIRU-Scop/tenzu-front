/*
 * Copyright (C) 2025-2026 BIRU
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

import { InputSignal, InputSignalWithTransform, OutputEmitterRef } from "@angular/core";
import { IconName, LevelType } from "@tenzu/shared/components/ui/ui.types";
import { JsonObject } from "@tenzu/repository/base/misc.model";
import { MatChipEvent, MatChipSelectionChange } from "@angular/material/chips";

export interface ChipInterface {
  translocoKey: InputSignal<string>;
  translocoValue: InputSignal<JsonObject>;
  iconName: InputSignal<IconName | undefined>;
  disabled: InputSignal<boolean>;
  deletable: InputSignal<boolean>;
  variant: InputSignal<"chip" | "option">;
  selected: InputSignal<boolean>;
  level:
    | InputSignalWithTransform<
        "" | "primary-chip" | "secondary-chip" | "tertiary-chip" | "warning-chip" | "error-chip" | "success-chip",
        LevelType
      >
    | InputSignal<LevelType>;
  removed: OutputEmitterRef<MatChipEvent>;
  selectionChange: OutputEmitterRef<MatChipSelectionChange>;
}
