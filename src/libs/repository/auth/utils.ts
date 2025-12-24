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

import { effect, inject, untracked } from "@angular/core";
import { FieldTree } from "@angular/forms/signals";
import { AuthConfigStore } from "./auth-config.store";

export function trackFormValidationEffect(form: FieldTree<unknown>) {
  const authConfigStore = inject(AuthConfigStore);
  return effect((onCleanup) => {
    const isInvalid = form().invalid();
    const isTouched = form().touched();
    untracked(() => {
      if (isTouched && isInvalid) {
        authConfigStore.setFormHasError(true);
      } else {
        authConfigStore.setFormHasError(false);
      }
    });
    onCleanup(() => {
      authConfigStore.resetFormHasError();
    });
  });
}
