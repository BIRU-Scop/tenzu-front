import { RE_SYMBOLS } from "@tenzu/utils";

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
    } else {
      throw new Error(`[PASSWORD][CHARACTER_COUNTS] Unhandled character: ${char}`, { cause: char });
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
