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

import {
  CharacterCountsType,
  countCharacters,
  DiversityType,
  getSeverity,
  PasswordRequirements,
  PasswordSeverity,
  stringDiversity,
} from "./_utils";
import { expect } from "vitest";
import { SYMBOLS } from "@tenzu/utils/functions/strings";

const DEFAULT_STRENGTH_SETTINGS = { lengthSecureThreshold: 15 };

function generatePassword(length: number, diversity: DiversityType[]): string {
  if (length < diversity.length) {
    throw Error("[TEST][GENERATE_PASSWORD] Invalid parameters: length must be equal or higher than diversity length");
  }
  let password = "";

  const getRandomInt = (max: number) => {
    // max excluded
    return Math.floor(Math.random() * max);
  };

  for (let i = 0; i < length; i++) {
    const chosenType = diversity[i % diversity.length];
    switch (chosenType) {
      case "lowercase":
        password += String.fromCharCode(97 + getRandomInt(26));
        break;
      case "numeric":
        password += getRandomInt(10).toString();
        break;
      case "symbol":
        password += SYMBOLS[getRandomInt(SYMBOLS.length)];
        break;
      case "uppercase":
        password += String.fromCharCode(65 + getRandomInt(26));
        break;
    }
  }
  return password;
}

describe("PasswordStrengthUtils", () => {
  // Variables types
  let passwordSettings = { strength: DEFAULT_STRENGTH_SETTINGS };
  let passwordRequirements: PasswordRequirements = {
    diversity: 3,
    minLength: 8,
    maxLength: 256,
  };

  beforeAll(async () => {
    passwordSettings = { strength: DEFAULT_STRENGTH_SETTINGS };
    passwordRequirements = {
      diversity: 3,
      minLength: 8,
      maxLength: 256,
    };
  });

  test.each([
    {
      passwordLength: passwordRequirements.minLength - 1,
      diversity: ["lowercase"],
      expectedSeverity: "weak",
      description: "Less than minLength chars should be 'weak'",
    },
    {
      passwordLength: passwordRequirements.minLength - 1,
      diversity: ["lowercase", "numeric", "symbol", "uppercase"],
      expectedSeverity: "weak",
      description: "Less than minLength chars & very high diversity should be 'weak'",
    },
    {
      passwordLength: passwordRequirements.minLength,
      diversity: ["lowercase"],
      expectedSeverity: "weak",
      description: "minLength chars is 'weak'",
    },
    {
      passwordLength: passwordSettings.strength.lengthSecureThreshold - 1,
      diversity: ["lowercase", "uppercase", "symbol"],
      expectedSeverity: "medium",
      description: "Diversity 3 & less than lengthSecureThreshold is 'medium'",
    },
    {
      passwordLength: passwordSettings.strength.lengthSecureThreshold - 1,
      diversity: ["numeric", "uppercase", "symbol"],
      expectedSeverity: "medium",
      description: "Diversity 3 & less than lengthSecureThreshold is 'medium'",
    },
    {
      passwordLength: passwordSettings.strength.lengthSecureThreshold - 1,
      diversity: ["lowercase", "uppercase", "numeric"],
      expectedSeverity: "medium",
      description: "Diversity 3 & less than lengthSecureThreshold is 'medium'",
    },
    {
      passwordLength: passwordSettings.strength.lengthSecureThreshold - 1,
      diversity: ["lowercase", "numeric", "symbol"],
      expectedSeverity: "medium",
      description: "Diversity 3 & less than lengthSecureThreshold is 'medium'",
    },
    {
      passwordLength: passwordSettings.strength.lengthSecureThreshold - 1,
      diversity: ["lowercase", "numeric", "symbol", "uppercase"],
      expectedSeverity: "strong",
      description: "Diversity 4 & less than lengthSecureThreshold is 'strong'",
    },
    {
      passwordLength: passwordSettings.strength.lengthSecureThreshold,
      diversity: ["lowercase", "numeric", "symbol"],
      expectedSeverity: "strong",
      description: "Diversity 3 & at least lengthSecureThreshold long 'strong'",
    },
    {
      passwordLength: passwordSettings.strength.lengthSecureThreshold,
      diversity: ["lowercase", "numeric", "uppercase"],
      expectedSeverity: "strong",
      description: "Diversity 3 & at least lengthSecureThreshold long 'strong'",
    },
    {
      passwordLength: passwordSettings.strength.lengthSecureThreshold,
      diversity: ["uppercase", "numeric", "symbol"],
      expectedSeverity: "strong",
      description: "Diversity 3 & at least lengthSecureThreshold long 'strong'",
    },
    {
      passwordLength: passwordSettings.strength.lengthSecureThreshold,
      diversity: ["lowercase", "uppercase", "symbol"],
      expectedSeverity: "strong",
      description: "Diversity 3 & at least lengthSecureThreshold long 'strong'",
    },
  ])(
    "getSeverity: $description (passwordLength: $passwordLength | diversity: $diversity | expectedSeverity: $expectedSeverity)",
    ({ passwordLength, diversity, expectedSeverity }) => {
      const password = generatePassword(passwordLength, diversity as DiversityType[]);
      const severity = getSeverity(password, passwordSettings, passwordRequirements);
      expect(severity).toMatch(expectedSeverity as PasswordSeverity);
    },
  );
  test("CountCharacters: All defined symbols are supposed to be allowed.", () => {
    const password = SYMBOLS;
    const characterCounts = countCharacters(password);
    const expectedCounts: CharacterCountsType = { lowercase: 0, uppercase: 0, numeric: 0, symbol: password.length };
    expect(characterCounts).toEqual(expectedCounts);
  });

  test("CountCharacters: Should be valid and return expected count.", () => {
    const characterCounts = countCharacters("azazAZ12345&@");
    const expectedCounts: CharacterCountsType = { lowercase: 4, uppercase: 2, numeric: 5, symbol: 2 };
    expect(characterCounts).toEqual(expectedCounts);
  });

  test("CountCharacters: Unhandled characters should simply be ignored", () => {
    const toBeCountedCharacters = "azazAZ12345&@";
    const toBeIgnoredCharacters = "£ùéà学中カタカナ";
    const characterCounts = countCharacters(toBeCountedCharacters + toBeIgnoredCharacters);
    const expectedCounts = { lowercase: 4, uppercase: 2, numeric: 5, symbol: 2 };
    expect(characterCounts).toEqual(expectedCounts);
  });

  test.each([
    {
      stringInput: "",
      expectedDiversity: [],
      description: "Empty",
    },
    {
      stringInput: "aonlylowerz",
      expectedDiversity: ["lowercase"],
      description: "Lowercase only",
    },
    {
      stringInput: "UPPERCASEZ",
      expectedDiversity: ["uppercase"],
      description: "Uppercase only",
    },
    {
      stringInput: "1234567890",
      expectedDiversity: ["numeric"],
      description: "Numeric only",
    },
    {
      stringInput: "&@?:=!",
      expectedDiversity: ["symbol"],
      description: "Symbol only",
    },
    {
      stringInput: "allIN1!",
      expectedDiversity: ["lowercase", "numeric", "uppercase", "symbol"],
      description: "All types",
    },
  ])(
    "stringDiversity: $description (stringInput: $stringInput | expectedDiversity: $expectedDiversity)",
    ({ stringInput, expectedDiversity }) => {
      const diversity = stringDiversity(stringInput);
      expect(diversity).toEqual(expectedDiversity.sort() as DiversityType[]);
    },
  );
});
