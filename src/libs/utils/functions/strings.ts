function escapeStringForRegExp(stringExpression: string) {
  return stringExpression.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export const SYMBOLS = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
export const RE_SYMBOLS = new RegExp(`[${escapeStringForRegExp(SYMBOLS)}]`);
