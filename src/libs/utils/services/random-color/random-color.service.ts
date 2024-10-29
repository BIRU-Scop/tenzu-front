import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class RandomColorService {
  public static randomColorPicker(): number {
    const max = 8;
    const min = 1;
    return Math.floor(Math.random() * (max - min) + min);
  }

  public static getColorClass(colorId: number): string {
    return "color-" + colorId.toString();
  }
}
