import { Routes } from "@angular/router";
import { provideTranslocoScope } from "@jsverse/transloco";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./request-reset-password/request-reset-password.component").then((m) => m.RequestResetPasswordComponent),
    providers: [provideTranslocoScope("resetPassword")],
  },
  {
    path: ":token",
    loadComponent: () =>
      import("./reset-password-form/reset-password-form.component").then((m) => m.ResetPasswordFormComponent),
    providers: [provideTranslocoScope("resetPassword")],
  },
];
