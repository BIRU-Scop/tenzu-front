import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { BreadcrumbComponent } from "@tenzu/shared/components/breadcrumb";
import { PrimarySideNavComponent } from "@tenzu/shared/components/primary-side-nav";
import { BreadcrumbStore } from "@tenzu/data/breadcrumb";
import { WorkspaceStore } from "@tenzu/data/workspace";
import { toObservable } from "@angular/core/rxjs-interop";
import { ProjectStore } from "@tenzu/data/project";
import { SideNavStore } from "@tenzu/data/sidenav";
import { SidenavListWorkflowComponent } from "./sidenav-list-workflow/sidenav-list-workflow.component";

@Component({
  selector: "app-project-detail",
  standalone: true,
  imports: [RouterOutlet, BreadcrumbComponent, PrimarySideNavComponent],
  template: ` <router-outlet />`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailComponent {
  sideNavStore = inject(SideNavStore);
  workspaceStore = inject(WorkspaceStore);
  projectStore = inject(ProjectStore);
  breadcrumbStore = inject(BreadcrumbStore);
  baseUrl = computed(
    () => `/workspace/${this.workspaceStore.selectedEntity()?.id}/project/${this.projectStore.selectedEntity()?.id}`,
  );
  constructor() {
    toObservable(this.projectStore.selectedEntity).subscribe((project) => {
      this.sideNavStore.setAvatar(
        project ? { name: project.name, type: "workspace.general_title.project", color: project.color } : undefined,
      );
      if (project) {
        this.breadcrumbStore.setThirdLevel({
          label: "workspace.general_title.projects",
          link: "/",
          doTranslation: true,
        });
        this.breadcrumbStore.setFourthLevel({
          label: project.name,
          link: `project/${project.id}`,
          doTranslation: false,
        });
      }
    });
    this.breadcrumbStore.setFirstLevel({
      label: "workspace.general_title.workspaces",
      link: "/",
      doTranslation: true,
    });
    toObservable(this.baseUrl).subscribe((baseUrl) => {
      this.sideNavStore.setPrimaryNavItems([
        {
          label: "workspace.general_title.kanban",
          iconName: "view_column",
          href: `${baseUrl}/kanban`,
          testId: "kanban-link",
          componentConfig: {
            componentRef: SidenavListWorkflowComponent,
          },
        },
      ]);
      this.sideNavStore.setSecondaryNavItems([
        {
          label: "workspace.general_title.projectMembers",
          iconName: "group",
          href: `${baseUrl}/members`,
          testId: "members-link",
        },
        {
          label: "workspace.general_title.projectSettings",
          iconName: "settings",
          href: `${baseUrl}/settings`,
          testId: "settings-link",
        },
      ]);
    });

    toObservable(this.workspaceStore.selectedEntity).subscribe((workspace) => {
      if (workspace) {
        this.breadcrumbStore.setSecondLevel({
          label: workspace.name,
          link: `workspace/${workspace.id}`,
          doTranslation: false,
        });
      }
    });
  }
}
