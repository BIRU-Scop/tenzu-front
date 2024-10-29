import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core";
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { RouterLink } from "@angular/router";
import { AvatarListComponent } from "@tenzu/shared/components/avatar/avatar-list/avatar-list.component";
import { UserMinimal } from "@tenzu/data/user";
import { AssignDialogComponent } from "@tenzu/shared/components/assign-dialog/assign-dialog.component";
import { matDialogConfig } from "@tenzu/utils";
import { RelativeDialogService } from "@tenzu/utils/services";
import { MembershipStore } from "@tenzu/data/membership";
import { ProjectKanbanService } from "../project-kanban.service";
import { MatButton, MatIconButton } from "@angular/material/button";
import { TranslocoDirective } from "@jsverse/transloco";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "app-story-card",
  standalone: true,
  imports: [
    MatCard,
    MatCardHeader,
    RouterLink,
    MatCardContent,
    AvatarListComponent,
    MatCardTitle,
    MatButton,
    TranslocoDirective,
    AvatarComponent,
    MatIcon,
    MatIconButton,
  ],
  template: `
    <mat-card appearance="outlined" *transloco="let t; prefix: 'workflow.detail_story'">
      <mat-card-header>
        <mat-card-title
          ><a [routerLink]="['../..', 'story', ref()]" class="line-clamp-2 w-fit"
            ><span class="text-tertiary-40">#{{ ref() }}</span> {{ title() }}</a
          ></mat-card-title
        >
      </mat-card-header>
      <mat-card-content>
        @if (users().length > 0) {
          <button (click)="openAssignStoryDialog($event)">
            <app-avatar-list [users]="users()" [prioritizeCurrentUser]="true" />
          </button>
        } @else {
          <button
            mat-icon-button
            type="button"
            (click)="openAssignStoryDialog($event)"
            [attr.aria-label]="t('add_assignees')"
          >
            <mat-icon>add</mat-icon>
          </button>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryCardComponent {
  title = input.required<string>();
  ref = input.required<number>();
  users = input.required<UserMinimal[]>();

  membershipStore = inject(MembershipStore);

  relativeDialog = inject(RelativeDialogService);
  projectKanbanService = inject(ProjectKanbanService);

  openAssignStoryDialog(event: MouseEvent): void {
    const teamMembers = this.membershipStore.projectEntities();
    const dialogRef = this.relativeDialog.open(AssignDialogComponent, event?.target, {
      ...matDialogConfig,
      relativeXPosition: "left",
      data: {
        assigned: this.users(),
        teamMembers: teamMembers,
      },
    });
    dialogRef.componentInstance.memberAssigned.subscribe((username) =>
      this.projectKanbanService.assignStory(username, null, this.ref()),
    );
    dialogRef.componentInstance.memberUnassigned.subscribe((username) =>
      this.projectKanbanService.removeAssignStory(username, null, this.ref()),
    );
  }
}
