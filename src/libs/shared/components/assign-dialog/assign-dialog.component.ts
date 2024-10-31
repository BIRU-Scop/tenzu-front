/*
 * Copyright (C) 2024 BIRU
 *
 * This file is part of Tenzu.
 *
 * Tenzu is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * You can contact BIRU at ask@biru.sh
 *
 */

import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatListOption, MatSelectionList, MatSelectionListChange } from "@angular/material/list";
import { MatDivider } from "@angular/material/divider";
import { ProjectMembership } from "@tenzu/data/membership";
import { startWith, tap } from "rxjs";
import { UserCardComponent } from "@tenzu/shared/components/user-card";
import { toObservable } from "@angular/core/rxjs-interop";
import { UserMinimal } from "@tenzu/data/user";
import { AvatarListComponent } from "@tenzu/shared/components/avatar/avatar-list/avatar-list.component";
import { NotificationService } from "@tenzu/utils/services";

type AssignDialogData = {
  assigned: UserMinimal[];
  teamMembers: ProjectMembership[];
};

@Component({
  selector: "app-assign-dialog",
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogTitle,
    MatFormField,
    MatDialogActions,
    MatButton,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    TranslocoDirective,
    MatListOption,
    MatSelectionList,
    MatDivider,
    UserCardComponent,
    AvatarListComponent,
  ],
  template: `
    <ng-container *transloco="let t; prefix: 'component.assign'">
      <mat-dialog-content>
        <div class="flex flex-col gap-4 max-h-[50vh] overflow-y-hidden">
          @if ((assignedMembers.value?.length || 0) > 0) {
            <div class="flex flex-row items-center">
              <p class="pr-2">{{ t("assigned_to") }}</p>
              <app-avatar-list [users]="assignedMembers.value!" [prioritizeCurrentUser]="true" />
            </div>
          } @else {
            <p class="mat-body-medium">{{ t("not_assigned") }}</p>
          }
          <mat-divider />
          <mat-form-field class="mt-2">
            <mat-label id="aria-label">{{ t("label") }}</mat-label>
            <input
              #searchInput
              matInput
              [formControl]="search_input"
              data-testid="assigned-input"
              [placeholder]="t('search_placeholder')"
            />
          </mat-form-field>
          <div class="h-full overflow-y-auto">
            @if (filteredTeamMembers()) {
              <mat-selection-list (selectionChange)="optionSelected($event)">
                @for (member of sortedByFullName(); track member.user.username) {
                  <mat-list-option class="flex flex-row" [selected]="memberIsAssigned(member)" [value]="member">
                    <app-user-card
                      [fullName]="member.user.fullName"
                      [username]="member.user.username"
                      [color]="member.user.color"
                      [textToHighlight]="searchInput.value"
                    ></app-user-card>
                  </mat-list-option>
                }
              </mat-selection-list>
            } @else {
              <p class="mat-body-medium">{{ t("no_members") }}</p>
            }
          </div>
        </div>
      </mat-dialog-content>
    </ng-container>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignDialogComponent {
  fb = inject(FormBuilder);
  data = inject<AssignDialogData>(MAT_DIALOG_DATA);
  notificationService = inject(NotificationService);

  readonly dialogRef = inject(MatDialogRef<AssignDialogComponent>);

  protected filteredTeamMembers = signal<Array<ProjectMembership>>([]);
  protected sortedByFullName = computed(() => {
    const teamMembers = this.filteredTeamMembers();
    return teamMembers.sort(this.sortByFullName);
  });
  protected teamMembers = signal<Array<ProjectMembership>>(this.data.teamMembers || []);
  protected search_input = this.fb.control("");

  assignedMembers = this.fb.control(this.data.assigned || []);

  memberAssigned = output<string>();
  memberUnassigned = output<string>();

  constructor() {
    toObservable(this.teamMembers).subscribe((value) => this.filteredTeamMembers.set(value || []));
    this.search_input.valueChanges
      .pipe(
        startWith(""),
        tap((memberName: string | null) => {
          let filterValue = memberName || "";
          filterValue = filterValue.toLowerCase() || "";
          this.filteredTeamMembers.set(
            this.teamMembers()?.filter((member) => {
              return member.user.fullName.toLowerCase().includes(filterValue);
            }) || [],
          );
        }),
      )
      .subscribe();
  }

  sortByFullName(a: ProjectMembership, b: ProjectMembership) {
    if (a.user.fullName < b.user.fullName) {
      return -1;
    }
    if (a.user.fullName > b.user.fullName) {
      return 1;
    }
    return 0;
  }

  memberIsAssigned(member: ProjectMembership) {
    const result = this.assignedMembers.value?.find(
      (memberElement: UserMinimal) => memberElement.fullName === member.user.fullName,
    );
    return !!result;
  }

  optionSelected(event: MatSelectionListChange) {
    const member: ProjectMembership = event.options[0].value;
    let newValue: UserMinimal[] = [...this.assignedMembers.value!];
    if (!this.memberIsAssigned(member)) {
      newValue = [member.user, ...newValue];
      this.memberAssigned.emit(member.user.username);
    } else if (this.memberIsAssigned(member)) {
      newValue.splice(
        newValue.findIndex((assigned_member: UserMinimal) => assigned_member.username === member.user.username),
        1,
      );
      this.memberUnassigned.emit(member.user.username);
    } else {
      this.notificationService.error({
        title: "Unexpected assign",
        detail: `[ASSIGN][DIALOG] Could not assign member ${member.user.username}.`,
      });
    }
    this.assignedMembers.setValue(newValue);
  }
}
