/*
 * Copyright (C) 2026 BIRU
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

import { computed, signal } from "@angular/core";
import { patchState, signalStore, withComputed, withMethods, withProps, withState } from "@ngrx/signals";
import { InvitationBase, InvitationStatus, Role } from "@tenzu/repository/membership";
import { UserNested } from "@tenzu/repository/user";
import { ProjectImportationPendingInvitationNested } from "@tenzu/repository/importation/importation.model";
import { PeopleEmailRow } from "./invite-people-dialog.type";
import { apply, applyEach, email, form, required, validate } from "@angular/forms/signals";
import { roleSelectorFieldSchema } from "@tenzu/shared/components/form/role-selector-field/role-selector-field.schema";
import { ItemType } from "@tenzu/repository/base/misc.model";

export const InvitePeopleStore = signalStore(
  withState<{
    existingMembers: UserNested[];
    existingInvitations: InvitationBase[];
    userRole: Role | undefined;
    itemType: ItemType;
  }>({ existingMembers: [], existingInvitations: [], userRole: undefined, itemType: "project" }),

  withComputed((store) => {
    const memberEmails = computed(() => store.existingMembers().map((member) => member.email));
    const notAcceptedInvitations = computed(() =>
      store.existingInvitations().filter((invitation) => invitation.status !== InvitationStatus.ACCEPTED),
    );
    const notAcceptedInvitationEmails = computed(() => notAcceptedInvitations().map((invitation) => invitation.email));
    return { memberEmails, notAcceptedInvitations, notAcceptedInvitationEmails };
  }),
  withProps((store) => {
    const emailRowsModel = signal<{ emailRows: PeopleEmailRow[] }>({ emailRows: [] });
    const peopleEmailsForm = form(emailRowsModel, (path) => {
      applyEach(path.emailRows, (item) => {
        required(item.emailGroup.email, { message: "component.email.errors.required" });
        email(item.emailGroup.email, { message: "component.email.errors.email" });
        apply(
          item.roleId,
          roleSelectorFieldSchema(
            () => store.userRole(),
            () => store.itemType(),
          ),
        );
        validate(item.emailGroup.email, ({ value }) => {
          return store.memberEmails().includes(value())
            ? { kind: "memberExists", message: "component.invite_dialog.member_error", path: item.emailGroup }
            : null;
        });
        validate(item.emailGroup.email, ({ value, valueOf }) => {
          if (store.notAcceptedInvitationEmails().includes(value()) && !valueOf(item.emailGroup.resendExisting)) {
            return {
              kind: "alreadyInvited",
              message: "component.invite_dialog.duplicate_error",
              path: item.emailGroup,
            };
          }
          return null;
        });
      });
    });
    return {
      emailRowsModel: emailRowsModel,
      peopleEmailsForm: peopleEmailsForm,
    };
  }),
  withComputed((store) => ({
    formInvalid: computed(() => {
      const length = store.emailRowsModel().emailRows.length;
      const invalid = store.peopleEmailsForm().invalid();
      return !length || invalid;
    }),
    validValue: computed(() =>
      store.emailRowsModel().emailRows.map(({ emailGroup, roleId }) => ({ email: emailGroup.email, roleId })),
    ),
  })),
  withMethods((store) => ({
    setContext(
      existingMembers: UserNested[],
      existingInvitations: InvitationBase[],
      userRole: Role | undefined,
      itemType: ItemType,
    ) {
      patchState(store, { existingMembers, existingInvitations, userRole, itemType });
    },
    addInitialInvites(initialInvites: ProjectImportationPendingInvitationNested[]) {
      const existing = store.emailRowsModel().emailRows;
      const newRows: PeopleEmailRow[] = initialInvites
        .filter((invite) => !existing.some((row) => row.emailGroup.email === invite.email))
        .map((invite) => ({
          emailGroup: { email: invite.email, resendExisting: false },
          roleId: invite.roleId,
        }));
      if (newRows.length) {
        store.emailRowsModel.update((value) => ({ emailRows: [...value.emailRows, ...newRows] }));
      }
    },
    addEmails(raw: string) {
      const existing = store.emailRowsModel().emailRows;
      const notAccepted = store.notAcceptedInvitations();
      const newRows: PeopleEmailRow[] = [];
      raw.split(",").forEach((str) => {
        const value = str.trim();
        if (!value || existing.some((row) => row.emailGroup.email === value)) {
          return;
        }
        if (newRows.some((row) => row.emailGroup.email === value)) {
          return;
        }
        const existingInvitation = notAccepted.find((invitation) => invitation.email === value);
        newRows.push({
          emailGroup: { email: value, resendExisting: false },
          roleId: existingInvitation?.roleId ?? null,
        });
      });
      if (newRows.length) {
        store.emailRowsModel.update((value) => ({ emailRows: [...value.emailRows, ...newRows] }));
      }
    },
    removeRow(index: number) {
      store.emailRowsModel.update((value) => ({
        emailRows: value.emailRows.filter((_, position) => position !== index),
      }));
    },
  })),
);
export type InvitePeopleStore = InstanceType<typeof InvitePeopleStore>;
