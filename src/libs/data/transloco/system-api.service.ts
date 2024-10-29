import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map } from "rxjs";
import { environment } from "../../../environments/environment";
import { Language } from "./language.model";
import { TranslocoService } from "@jsverse/transloco";

@Injectable({
  providedIn: "root",
})
export class SystemApiService {
  http = inject(HttpClient);
  translocoService = inject(TranslocoService);

  initLanguage() {
    return this.getLanguages().pipe(
      map((langs) => {
        const availableCodes = langs.map((lang) => lang.code);
        const defaultLang = langs.find((lang) => lang.isDefault);

        this.translocoService.setAvailableLangs(availableCodes);

        if (defaultLang) {
          this.translocoService.setDefaultLang(defaultLang.code);
          this.translocoService.setFallbackLangForMissingTranslation({
            fallbackLang: defaultLang.code,
          });
        }
        return langs;
      }),
    );
  }
  getLanguages() {
    return this.http.get<Language[]>(
      `${environment.api.scheme}://${environment.api.baseDomain}/${environment.api.suffixDomain}/${environment.api.prefix}/system/languages`,
    );
  }
}
