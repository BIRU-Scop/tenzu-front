import { Routes } from "@angular/router";
import { loginGuard } from "./guards/login.guard";
import { provideTranslocoScope } from "@jsverse/transloco";
import { WorkspaceInvitationGuard } from "./guards/workspace-invitation.guard";
import { VerifyEmailGuard } from "./guards/verify-email.guard";
import { ProjectInvitationGuard } from "./guards/project-invitation.guard";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./home/home.component").then((m) => m.HomeComponent),
    providers: [provideTranslocoScope("home")],
    canActivate: [loginGuard],
    canActivateChild: [loginGuard],
    children: [
      {
        path: "",
        loadChildren: () => import("./workspace/routes").then((m) => m.routes),
      },
      {
        path: "settings",
        loadChildren: () => import("./settings/routes").then((m) => m.routes),
      },
      {
        path: "new-project",
        loadComponent: () =>
          import("./project/project-create/project-create.component").then((m) => m.ProjectCreateComponent),
        providers: [provideTranslocoScope("project")],
      },
    ],
  },
  {
    path: "accept-project-invitation/:token",
    children: [],
    canActivate: [ProjectInvitationGuard],
  },
  {
    path: "accept-workspace-invitation/:token",
    children: [],
    canActivate: [WorkspaceInvitationGuard],
  },
  {
    path: "signup/verify/:token",
    children: [],
    canActivate: [VerifyEmailGuard],
  },
  {
    path: "",
    loadComponent: () =>
      import("../libs/shared/layouts/auth-layout/auth-layout.component").then((m) => m.AuthLayoutComponent),
    children: [
      {
        path: "login",
        loadComponent: () => import("./login/login.component").then((m) => m.LoginComponent),
        providers: [provideTranslocoScope("login")],
      },
      {
        path: "reset-password",
        loadChildren: () => import("./reset-password/routes").then((m) => m.routes),
      },
      {
        path: "signup",
        loadComponent: () => import("./signup/signup.component").then((m) => m.SignupComponent),
        providers: [provideTranslocoScope("signup")],
      },
    ],
  },
];
