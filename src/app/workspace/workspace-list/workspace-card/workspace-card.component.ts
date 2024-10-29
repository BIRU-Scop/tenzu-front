import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { MatCard, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { TranslocoDirective } from "@jsverse/transloco";
import { AvatarComponent } from "@tenzu/shared/components/avatar";

@Component({
  selector: "app-workspace-card",
  standalone: true,
  imports: [
    AvatarComponent,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatIcon,
    RouterLink,
    RouterLinkActive,
    MatButton,
    TranslocoDirective,
  ],
  template: `
    <mat-card appearance="outlined" class="heading-card" *transloco="let t; prefix: 'commons'">
      <mat-card-header>
        <app-avatar mat-card-avatar [name]="name()" [color]="color()" />
        <mat-card-title>
          <a [routerLink]="['workspace', id()]">{{ name() }} </a></mat-card-title
        >
        <button
          class="primary-button"
          routerLink="new-project"
          [queryParams]="{ workspaceId: id() }"
          routerLinkActive="active"
          ariaCurrentWhenActive="page"
          mat-stroked-button
        >
          <mat-icon>add</mat-icon>
          {{ t("project") }}
        </button>
      </mat-card-header>
    </mat-card>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceCardComponent {
  name = input("");
  color = input(1);
  id = input("");
}
