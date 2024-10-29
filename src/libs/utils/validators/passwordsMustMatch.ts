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
