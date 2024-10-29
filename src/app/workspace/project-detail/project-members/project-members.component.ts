import { ChangeDetectionStrategy, Component, inject, model } from "@angular/core";
import { BreadcrumbStore } from "@tenzu/data/breadcrumb";
import { MatButton } from "@angular/material/button";
import { TranslocoDirective, TranslocoService } from "@jsverse/transloco";
import { InvitePeoplesDialogComponent } from "@tenzu/shared/components/invite-peoples-dialog/invite-peoples-dialog.component";
import { matDialogConfig } from "@tenzu/utils";
import { MatDialog } from "@angular/material/dialog";
import { ProjectStore } from "@tenzu/data/project";
import { MembershipStore } from "@tenzu/data/membership";
import { MatList } from "@angular/material/list";
import { MatTab, MatTabGroup, MatTabLabel } from "@angular/material/tabs";
import { animate, query, stagger, style, transition, trigger } from "@angular/animations";
import { MatIcon } from "@angular/material/icon";
import { UserCardComponent } from "@tenzu/shared/components/user-card";

@Component({
  selector: "app-project-members",
  standalone: true,
  imports: [TranslocoDirective, MatButton, MatList, MatTabGroup, MatTab, MatTabLabel, UserCardComponent, MatIcon],
  template: `
    <div class="flex flex-col gap-y-8" *transloco="let t; prefix: 'project.members'">
      <div class="flex flex-row">
        <h1 class="mat-headline-medium grow">{{ t("title") }}</h1>

        <button (click)="openCreateDialog()" class="primary-button" mat-stroked-button>
          {{ t("invite_to_project") }}
        </button>
      </div>
      <mat-tab-group [(selectedIndex)]="selectedTabIndex" mat-stretch-tabs="false" mat-align-tabs="start">
        @if (membershipStore.projectEntities().length > 0) {
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="icon-sm mr-1">group</mat-icon>
              {{ t("members_tab") }}
            </ng-template>
            <mat-list>
              @for (member of membershipStore.projectEntities(); track member.user.username) {
                <app-user-card
                  [fullName]="member.user.fullName"
                  [username]="member.user.username"
                  [color]="member.user.color"
                ></app-user-card>
              }</mat-list
          ></mat-tab>
        }
        @if (membershipStore.projectInvitationsEntities().length > 0) {
          <mat-tab [label]="t('pending_tab')">
            <ng-template mat-tab-label>
              <mat-icon class="icon-sm mr-1">schedule</mat-icon>
              {{ t("pending_tab") }}
            </ng-template>
            <mat-list [@newItemsFlyIn]="membershipStore.projectInvitationsEntities().length">
              @for (pendingMember of membershipStore.projectInvitationsEntities(); track pendingMember.id) {
                <app-user-card [fullName]="pendingMember.email!"></app-user-card>
              }</mat-list
          ></mat-tab>
        }
      </mat-tab-group>
    </div>
  `,
  animations: [
    trigger("newItemsFlyIn", [
      transition(":enter, * => 0, * => -1", []),
      transition(":increment", [
        query(
          ":enter",
          [
            style({ opacity: 0, height: 0 }),
            stagger(50, [animate("400ms ease-out", style({ opacity: 1, height: "*" }))]),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectMembersComponent {
  breadcrumbStore = inject(BreadcrumbStore);
  readonly dialog = inject(MatDialog);
  projectStore = inject(ProjectStore);
  membershipStore = inject(MembershipStore);
  translocoService = inject(TranslocoService);

  selectedTabIndex = model(0);

  constructor() {
    this.breadcrumbStore.setFifthLevel({
      label: "workspace.general_title.projectMembers",
      link: "",
      doTranslation: true,
    });
    this.breadcrumbStore.setSixthLevel(undefined);
  }

  public openCreateDialog(): void {
    const dialogRef = this.dialog.open(InvitePeoplesDialogComponent, {
      ...matDialogConfig,
      minWidth: 800,
      data: {
        title:
          this.translocoService.translateObject("component.invite_dialog.invite_peoples") +
          " " +
          this.translocoService.translateObject("component.invite_dialog.to") +
          " " +
          this.projectStore.selectedEntity()?.name,
        description: this.translocoService.translateObject("project.members.description_modal"),
      },
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.membershipStore.sendProjectInvitations(this.projectStore.selectedEntity()!.id, result);
        this.selectedTabIndex.set(1);
      }
    });
  }
}