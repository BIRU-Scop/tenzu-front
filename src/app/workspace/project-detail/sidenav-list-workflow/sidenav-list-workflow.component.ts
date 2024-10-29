import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatListItem, MatListItemIcon, MatNavList } from "@angular/material/list";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { Project, ProjectStore } from "@tenzu/data/project";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatIconAnchor } from "@angular/material/button";
import { WorkspaceStore } from "@tenzu/data/workspace";
import { SideNavStore } from "@tenzu/data/sidenav";

@Component({
  selector: "app-sidenav-list-workflow",
  standalone: true,
  imports: [
    MatIcon,
    MatListItem,
    RouterLinkActive,
    RouterLink,
    TranslocoDirective,
    MatIconAnchor,
    MatNavList,
    MatListItemIcon,
  ],
  template: `
        <ng-container *transloco="let t">
            @let project = projectStore.selectedEntity() ;
            @let workspace = workspaceStore.selectedEntity() ;
            @if (project && workspace) {
                @if (!sideNavStore.resized()) {
                    <div class="flex flex-row items-center gap-2 px-2"><span
                            class="text-neutral-60 mat-body-medium">{{ t("workspace.general_title.kanban") }}</span> <a
                            class="nav-button flex flex-row items-center justify-center rounded-full"
                            [routerLink]="['/workspace', workspace.id, 'project', project.id, 'new-workflow']">
                        <mat-icon>add</mat-icon>
                    </a></div>
                } @else {
                    <a class="mb-1 nav-button w-full flex flex-row items-center justify-center"
                       [routerLink]="['/workspace', workspace.id, 'project', project.id, 'new-workflow']">
                        <mat-icon>add</mat-icon>
                    </a>
                }

                <mat-nav-list attr.aria-label="{{ t('workflow.general_title.kanban') }}">
                    @for (workflow of project.workflows; track workflow.id) {
                        @if (!sideNavStore.resized()) {
                            <a
                                    mat-list-item
                                    href="#"
                                    [routerLink]="['/workspace', workspace.id, 'project', project.id, 'kanban',  workflow.slug]"
                                    routerLinkActive
                                    #routerLinkActive="routerLinkActive"
                                    [activated]="routerLinkActive.isActive"
                            >
                                <mat-icon matListItemIcon>view_column</mat-icon>
                                {{ workflow?.name }}
                            </a>
                        } @else {
                            <a
                                    class="resized"
                                    mat-list-item
                                    href="#"
                                    [routerLink]="['/workspace', workspace.id, 'project', project.id, 'kanban',  workflow.slug]"
                                    routerLinkActive
                                    #routerLinkActive="routerLinkActive"
                                    [activated]="routerLinkActive.isActive"
                            >
                                <mat-icon>view_column</mat-icon>
                            </a>
                        }
                    }
                </mat-nav-list>
            }
        </ng-container>
    `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavListWorkflowComponent {
  projectStore = inject(ProjectStore);
  workspaceStore = inject(WorkspaceStore);
  sideNavStore = inject(SideNavStore);

  async add(project: Project) {
    await this.projectStore.createWorkflow(project.id, { name: "toto" });
    await this.projectStore.getProject(project.id);
  }
}