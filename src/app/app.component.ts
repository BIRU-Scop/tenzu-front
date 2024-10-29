import { Component, inject, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { MatIconRegistry } from "@angular/material/icon";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent implements OnInit {
  title = "tenzu";
  iconRegistry = inject(MatIconRegistry);
  ngOnInit(): void {
    this.iconRegistry.setDefaultFontSetClass("material-symbols-outlined");
  }
}
