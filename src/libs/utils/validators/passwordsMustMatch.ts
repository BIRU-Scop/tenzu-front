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

import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export const passwordsMustMatch: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const newPassword = control.get("newPassword");
  const repeatPassword = control.get("repeatPassword");
  if (!newPassword || !repeatPassword) {
    throw new Error("Invalid form");
  }
  if (newPassword.errors) {
    return newPassword.errors;
  }
  if (repeatPassword.errors) {
    return repeatPassword.errors;
  }
  if (newPassword.value !== repeatPassword.value) {
    newPassword.setErrors({ passwordNotMatch: true });
    repeatPassword.setErrors({ passwordNotMatch: true });
    return { passwordNotMatch: true };
  }
  return null;
};
