import { NgModule } from "@angular/core";
import { inject } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";

@NgModule({})
export class MatIconRegistryConfig {
  iconRegistry = inject(MatIconRegistry);

  constructor() {
    this.iconRegistry.setDefaultFontSetClass("material-symbols-outlined");
  }
}
