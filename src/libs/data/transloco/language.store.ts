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
