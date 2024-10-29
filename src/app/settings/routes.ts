import { Routes } from "@angular/router";
import { provideTranslocoScope } from "@jsverse/transloco";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./settings.component").then((m) => m.SettingsComponent),
    providers: [provideTranslocoScope("settings")],
    children: [
      { path: "", redirectTo: "profile", pathMatch: "full" },
      {
        path: "profile",
        loadComponent: () => import("./profile/profile.component").then((m) => m.ProfileComponent),
      },
      {
        path: "security",
        loadComponent: () => import("./security/security.component").then((m) => m.SecurityComponent),
        providers: [provideTranslocoScope("settings")],
      },
      {
        path: "delete",
        loadComponent: () => import("./delete/delete.component").then((m) => m.DeleteComponent),
        providers: [provideTranslocoScope("settings")],
      },
    ],
  },
];
