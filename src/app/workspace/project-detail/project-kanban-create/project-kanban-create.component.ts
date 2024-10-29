import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ProjectKanbanSkeletonComponent } from "../project-kanban-skeleton/project-kanban-skeleton.component";
import { matDialogConfig } from "@tenzu/utils";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { EnterNameDialogComponent } from "@tenzu/shared/components/enter-name-dialog/enter-name-dialog.component";
import { BreadcrumbStore } from "@tenzu/data/breadcrumb";
import { TranslocoDirective } from "@jsverse/transloco";
import { Workflow, WorkflowStore } from "@tenzu/data/workflow";
import { ProjectStore } from "@tenzu/data/project";

@Component({
  selector: "app-project-kanban-create",
  standalone: true,
  imports: [ProjectKanbanSkeletonComponent, TranslocoDirective],
  template: ` <app-project-kanban-skeleton *transloco="let t"></app-project-kanban-skeleton> `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectKanbanCreateComponent {
  readonly breadcrumbStore = inject(BreadcrumbStore);
  readonly workflowStore = inject(WorkflowStore);
  readonly projectStore = inject(ProjectStore);
  readonly dialog = inject(MatDialog);
  readonly router = inject(Router);
  readonly activatedRoute = inject(ActivatedRoute);

  constructor() {
    this.openCreateDialog();
    this.breadcrumbStore.setFifthLevel({
      label: "workspace.general_title.kanban",
      doTranslation: true,
    });
    this.breadcrumbStore.setSixthLevel({
      label: "workflow.create_workflow.dialog.create_workflow",
      doTranslation: true,
    });
  }

  public openCreateDialog(): void {
    const dialogRef = this.dialog.open(EnterNameDialogComponent, {
      ...matDialogConfig,
      backdropClass: "cdk-overlay-transparent-backdrop",
      data: {
        label: "workflow.create_workflow.dialog.aria_label",
        action: "workflow.create_workflow.dialog.create_workflow",
        requiredError: "workflow.create_workflow.dialog.name_required",
        placeholder: "workflow.create_workflow.dialog.name_placeholder",
      },
    });
    dialogRef.afterClosed().subscribe(async (name?: Pick<Workflow, "name">) => {
      if (name) {
        const projectId = this.projectStore.selectedEntity()!.id;
        const workflow = await this.workflowStore.createWorkflow(projectId, name);
        this.projectStore.getProject(projectId);
        await this.router.navigate(["..", "kanban", workflow.slug], { relativeTo: this.activatedRoute });
      } else {
        await this.router.navigate([".."], { relativeTo: this.activatedRoute });
      }
    });
  }
}
