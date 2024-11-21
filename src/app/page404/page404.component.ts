import { ChangeDetectionStrategy, Component } from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatAnchor } from "@angular/material/button";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-page404",
  standalone: true,
  imports: [TranslocoDirective, RouterLink, MatAnchor],
  template: ` <div *transloco="let t; prefix: 'errorPages.404'">
    <div>{{ t("title") }}</div>
    <div>{{ t("text") }}</div>
    <a mat-button [routerLink]="'/'">{{ t("call_for_action") }}</a>
  </div>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Page404Component {}
