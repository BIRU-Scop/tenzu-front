import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { PrimarySideNavComponent } from "@tenzu/shared/components/primary-side-nav/";
import { WorkspaceStore } from "@tenzu/data/workspace";
import { JsonPipe } from "@angular/common";
import { BreadcrumbComponent } from "@tenzu/shared/components/breadcrumb";
import { BreadcrumbStore } from "@tenzu/data/breadcrumb/breadcrumb.store";
import { toObservable } from "@angular/core/rxjs-interop";
import { SideNavStore } from "@tenzu/data/sidenav";

@Component({
  selector: "app-workspace-detail",
  standalone: true,
  imports: [RouterOutlet, PrimarySideNavComponent, JsonPipe, BreadcrumbComponent],
  template: ` <router-outlet />`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceDetailComponent {
  sideNavStore = inject(SideNavStore);
  workspaceStore = inject(WorkspaceStore);
  breadcrumbStore = inject(BreadcrumbStore);

  constructor() {
    toObservable(this.workspaceStore.selectedEntity).subscribe((workspace) => {
      this.sideNavStore.setAvatar(
        workspace
          ? { name: workspace.name, type: "workspace.general_title.workspace", color: workspace.color }
          : undefined,
      );
    });
    this.sideNavStore.setPrimaryNavItems([
      {
        label: "workspace.general_title.workspaceListProjects",
        iconName: "lists",
        href: "projects",
        testId: "projects-link",
      },
    ]);
    this.sideNavStore.setSecondaryNavItems([
      {
        label: "workspace.general_title.workspacePeople",
        iconName: "group",
        href: "people",
        testId: "people-link",
      },
      {
        label: "workspace.general_title.workspaceSettings",
        iconName: "settings",
        href: "settings",
        testId: "settings-link",
      },
    ]);
    this.breadcrumbStore.setFourthLevel(undefined);

    this.breadcrumbStore.setFirstLevel({
      label: "workspace.general_title.workspaces",
      link: "/",
      doTranslation: true,
    });
    toObservable(this.workspaceStore.selectedEntity).subscribe((workspace) => {
      if (workspace) {
        this.breadcrumbStore.setSecondLevel({
          label: workspace.name,
          link: `workspace/${workspace.id}`,
          doTranslation: false,
        });
        this.breadcrumbStore.setFourthLevel(undefined);
      }
    });
  }
}
