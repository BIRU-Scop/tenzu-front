export interface Language {
  code: string;
  name: string;
  englishName: string;
  textDirection: "rtl" | "ltr";
  isDefault: boolean;
  scriptType: "latin" | "hebrew" | "cyrillic" | "arabic" | "chinese_and_devs";
}
