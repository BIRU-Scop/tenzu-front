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

import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";
import { SelectEntityId, setAllEntities, withEntities } from "@ngrx/signals/entities";
import { tap } from "rxjs";
import { Language } from "./language.model";
import { SystemApiService } from "./system-api.service";

const selectId: SelectEntityId<Language> = (language) => language.code;

export const LanguageStore = signalStore(
  { providedIn: "root" },

  withState<{ selectedLanguageId: undefined | string }>({
    selectedLanguageId: undefined,
  }),
  withEntities<Language>(),
  withMethods((store, languageService = inject(SystemApiService)) => ({
    initLanguages() {
      return languageService
        .initLanguage()
        .pipe(tap((values) => patchState(store, setAllEntities(values, { selectId }))));
    },
  })),
);

export type LanguageStore = InstanceType<typeof LanguageStore>;
