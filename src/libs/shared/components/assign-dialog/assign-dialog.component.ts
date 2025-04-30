/*
 * Copyright (C) 2024-2025 BIRU
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

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  model,
  output,
  signal,
} from "@angular/core";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef } from "@angular/material/dialog";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatListOption, MatSelectionList, MatSelectionListChange } from "@angular/material/list";
import { MatDivider } from "@angular/material/divider";
import { startWith, tap } from "rxjs";
import { UserCardComponent } from "@tenzu/shared/components/user-card";
import { toObservable } from "@angular/core/rxjs-interop";
import { UserNested } from "@tenzu/repository/user";
import { AvatarListComponent } from "@tenzu/shared/components/avatar/avatar-list/avatar-list.component";
import { NotificationService } from "@tenzu/utils/services/notification";

type AssignDialogData = {
  assignees: UserNested[];
  teamMembers: UserNested[];
};

@Component({
  selector: "app-assign-dialog",
  imports: [
    MatDialogContent,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    TranslocoDirective,
    MatListOption,
    MatSelectionList,
    MatDivider,
    UserCardComponent,
    AvatarListComponent,
    FormsModule,
  ],
  template: `
    <ng-container *transloco="let t; prefix: 'component.assign'">
      <mat-dialog-content>
        <div class="flex flex-col gap-4 max-h-[45vh] overflow-y-hidden">
          @if ((assignees.value?.length || 0) > 0) {
            <div class="flex flex-row items-center">
              <p class="pr-2">{{ t("assigned_to") }}</p>
              <app-avatar-list [users]="assignees.value!" [prioritizeCurrentUser]="true" />
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
              [(ngModel)]="searchInputControl"
              data-testid="assigned-input"
              [placeholder]="t('search_placeholder')"
            />
          </mat-form-field>
          <div class="h-full overflow-y-auto">
            @if (filteredTeamMembers()) {
              <mat-selection-list (selectionChange)="optionSelected($event)">
                @for (member of sortedByFullName(); track member.username) {
                  <mat-list-option class="flex flex-row" [selected]="memberIsAssigned(member)" [value]="member">
                    <app-user-card
                      [fullName]="member.fullName"
                      [username]="member.username"
                      [color]="member.color"
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

  protected filteredTeamMembers = linkedSignal(() => this.teamMembers() || []);
  protected sortedByFullName = computed(() => {
    const teamMembers = this.filteredTeamMembers();
    return teamMembers.sort(this.sortByFullName);
  });
  protected teamMembers = signal<Array<UserNested>>(this.data.teamMembers || []);
  protected searchInputControl = model<string>("");

  assignees = this.fb.control(this.data.assignees || []);

  memberAssigned = output<UserNested>();
  memberUnassigned = output<UserNested>();

  constructor() {
    toObservable(this.searchInputControl)
      .pipe(
        startWith(""),
        tap((memberName: string | null) => {
          let filterValue = memberName || "";
          filterValue = filterValue.toLowerCase() || "";
          this.filteredTeamMembers.set(
            this.teamMembers()?.filter((member) => {
              return member.fullName.toLowerCase().includes(filterValue);
            }) || [],
          );
        }),
      )
      .subscribe();
  }

  sortByFullName(a: UserNested, b: UserNested) {
    if (a.fullName < b.fullName) {
      return -1;
    }
    if (a.fullName > b.fullName) {
      return 1;
    }
    return 0;
  }

  memberIsAssigned(member: UserNested) {
    const result = this.assignees.value?.find(
      (memberElement: UserNested) => memberElement.fullName === member.fullName,
    );
    return !!result;
  }

  optionSelected(event: MatSelectionListChange) {
    const member: UserNested = event.options[0].value;
    let newValue: UserNested[] = [...this.assignees.value!];
    if (!this.memberIsAssigned(member)) {
      newValue = [member, ...newValue];
      this.memberAssigned.emit(member);
    } else if (this.memberIsAssigned(member)) {
      newValue.splice(
        newValue.findIndex((assigned_member: UserNested) => assigned_member.username === member.username),
        1,
      );
      this.memberUnassigned.emit(member);
    } else {
      this.notificationService.error({
        title: "Unexpected assign",
        detail: `[ASSIGN][DIALOG] Could not assign member ${member.username}.`,
      });
    }
    this.assignees.setValue(newValue);
  }
}
