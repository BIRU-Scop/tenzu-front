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

import { RE_SYMBOLS } from "@tenzu/utils/functions/strings";
import { z } from "zod";
import { ConfigModel } from "@tenzu/repository/config-app/config.model";

export type PasswordSeverity = "none" | "weak" | "medium" | "strong";

export type PasswordSettings = {
  enabledStrength: boolean;
  showStrengthBar?: boolean;
};

export function getDiversityCount(input: string): number {
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

  const counts = [lowercase, uppercase, numeric, symbol];
  return counts.filter((count) => count > 0).length;
}

export function getSeverity(password: string, config: ConfigModel): PasswordSeverity {
  const nbDiversity = getDiversityCount(password);
  const requirements = config.security.password;
  let severity: PasswordSeverity = "none";

  if (
    password.length > 0 &&
    (password.length < requirements.minLength || nbDiversity < requirements.numberDiversityDifference)
  ) {
    severity = "weak";
  } else if (
    nbDiversity == requirements.numberDiversityDifference &&
    password.length >= requirements.minLength &&
    password.length < requirements.lengthSecureThreshold!
  ) {
    severity = "medium";
  } else if (
    (nbDiversity > requirements.numberDiversityDifference && password.length >= requirements.minLength) ||
    (nbDiversity == requirements.numberDiversityDifference && password.length >= requirements.lengthSecureThreshold!)
  ) {
    severity = "strong";
  }

  return severity;
}

export const DEFAULT_SETTINGS: PasswordSettings = {
  enabledStrength: false,
  showStrengthBar: true,
};

export function hasXof4CharClasses(s: string) {
  let count = 0;
  if (/[a-z]/.test(s)) {
    count++;
  }
  if (/[A-Z]/.test(s)) {
    count++;
  }
  if (/\d/.test(s)) {
    count++;
  }
  if (RE_SYMBOLS.test(s)) {
    count++;
  }
  return count;
}

export function hasMinLength(value: string, minLength: number) {
  return z.string().min(minLength).safeParse(value).success;
}
export function hasNumber(value: string) {
  return z.string().regex(/\d/).safeParse(value).success;
}
export function hasLowercase(value: string) {
  return z.string().regex(/[a-z]/).safeParse(value).success;
}

export function hasUppercase(value: string) {
  return z.string().regex(/[A-Z]/).safeParse(value).success;
}
export function hasSymbol(value: string) {
  return z.string().regex(RE_SYMBOLS).safeParse(value).success;
}
