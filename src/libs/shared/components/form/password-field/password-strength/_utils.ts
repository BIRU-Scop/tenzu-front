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

import { RE_SYMBOLS } from "@tenzu/utils/functions/strings";

export enum DiversityEnum {
  lowercase = "lowercase",
  uppercase = "uppercase",
  numeric = "numeric",
  symbol = "symbol",
}

export type DiversityType = keyof typeof DiversityEnum;

export type CharacterCountsType = Record<DiversityType, number>;

export type PasswordSeverity = "none" | "weak" | "medium" | "strong";

export type StrengthSettings = {
  enabled: boolean;
  lengthSecureThreshold: number;
  showBar: boolean;
};

export type PasswordSettings = {
  strength: Partial<StrengthSettings>;
  label?: string;
};

export type PasswordRequirements = {
  diversity: number;
  minLength: number;
  maxLength: number;
};

export function countCharacters(input: string): CharacterCountsType {
  let lowercase = 0;
  let uppercase = 0;
  let numeric = 0;
  let symbol = 0;

  for (const char of input) {
    if (/[a-z]/.test(char)) {
      lowercase++;
    } else if (/[A-Z]/.test(char)) {
      uppercase++;
    } else if (/[0-9]/.test(char)) {
      numeric++;
    } else if (RE_SYMBOLS.test(char)) {
      symbol++;
    }
  }

  return { lowercase: lowercase, uppercase: uppercase, symbol: symbol, numeric: numeric };
}

export function stringDiversity(input: string): DiversityType[] {
  return Object.entries(countCharacters(input))
    .reduce((acc: DiversityType[], [key, value]) => {
      if (value > 0) {
        return [...acc, key] as DiversityType[];
      }
      return acc;
    }, [] as DiversityType[])
    .sort();
}

/** Severity determines password overall strength
 * Password minimal criteria:
 *  - 8 chars minimum
 *  - Three of these types of characters must be defined in the password:
 *      - 1 lowercase
 *      - 1 numeric
 *      - 1 symbol
 *      - 1 uppercase
 * @returns {PasswordSeverity, string} - PasswordSeverity determine strength bar CSS class
 * and the string is the label displayed in the template
 */
export function getSeverity(
  password: string,
  settings: PasswordSettings,
  requirements: PasswordRequirements,
): PasswordSeverity {
  const diversity = stringDiversity(password);
  let severity: PasswordSeverity = "none";

  if (password.length > 0 && (password.length < requirements.minLength || diversity.length < requirements.diversity)) {
    severity = "weak";
  } else if (
    diversity.length == requirements.diversity &&
    password.length >= requirements.minLength &&
    password.length < settings.strength.lengthSecureThreshold!
  ) {
    severity = "medium";
  } else if (
    (diversity.length > requirements.diversity && password.length >= requirements.minLength) ||
    (diversity.length == requirements.diversity && password.length >= settings.strength.lengthSecureThreshold!)
  ) {
    severity = "strong";
  }

  return severity;
}
