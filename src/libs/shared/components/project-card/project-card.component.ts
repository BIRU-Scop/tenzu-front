import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { AvatarComponent } from "../avatar/avatar.component";
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { TranslocoDirective } from "@jsverse/transloco";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-project-card",
  standalone: true,
  imports: [AvatarComponent, MatCard, MatCardHeader, MatCardTitle, MatCardContent, TranslocoDirective, RouterLink],
  template: `
    <mat-card appearance="outlined" class="min-h-[90px]" *transloco="let t; prefix: 'component.project_card'">
      <mat-card-header>
        <app-avatar mat-card-avatar [name]="name()" [color]="color()" />
        <mat-card-title>
          @if (projectId() && workspaceId()) {
            <a [routerLink]="['/', 'workspace', workspaceId(), 'project', projectId()]">{{ name() }}</a>
          } @else {
            {{ name() }}
          }
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>
          @if (!name() && !description() && !color()) {
            <a [routerLink]="'new-project'" [queryParams]="{ workspaceId: workspaceId() }">{{
              t("create_first_project")
            }}</a>
          } @else {
            <p>
              {{ description() }}
            </p>
          }
        </p>
      </mat-card-content>
    </mat-card>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCardComponent {
  name = input("");
  color = input(0);
  projectId = input<string | null>("");
  description = input<string | null>("");
  workspaceId = input<string | null>("");
}
