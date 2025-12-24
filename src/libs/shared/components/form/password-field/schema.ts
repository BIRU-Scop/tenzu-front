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

import { TranslocoService } from "@jsverse/transloco";
import { DEFAULT_SETTINGS, hasXof4CharClasses, PasswordSettings } from "./utils";
import { maxLength, minLength, required, schema, validate } from "@angular/forms/signals";

import { inject } from "@angular/core";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";

export const passwordSchema = (passwordSettings: Partial<PasswordSettings>) => {
  const translocoService = inject(TranslocoService);
  const config = inject(ConfigAppService).config();

  const _maxLength = 128;
  const settings = {
    ...DEFAULT_SETTINGS,
    ...passwordSettings,
  };

  return schema<string>((field) => {
    required(field, {
      message: () => translocoService.translate("component.password.errors.required"),
    });
    if (settings.enabledStrength) {
      const configPassword = config.security.password;

      minLength(field, configPassword.minLength, {
        message: () =>
          translocoService.translate("component.password.errors.minLength", {
            number: configPassword.minLength,
          }),
      });
      maxLength(field, _maxLength, {
        message: () =>
          translocoService.translate("component.password.errors.maxLength", {
            number: _maxLength,
          }),
      });
      validate(field, ({ value }) => {
        const numberDiversityFind = hasXof4CharClasses(value());
        if (numberDiversityFind < configPassword.numberDiversityDifference) {
          return {
            kind: "diversity",
            message: translocoService.translate("component.password.errors.strength", {
              numberDiversity: configPassword.numberDiversityDifference,
            }),
          };
        }
        return undefined;
      });
    }
  });
};
