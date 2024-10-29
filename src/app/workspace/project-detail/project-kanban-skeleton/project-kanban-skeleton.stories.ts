import type { Meta, StoryObj } from "@storybook/angular";
import { argsToTemplate } from "@storybook/angular";
import { ProjectKanbanSkeletonComponent } from "./project-kanban-skeleton.component";

const meta: Meta<ProjectKanbanSkeletonComponent> = {
  title: "Components/Skeletons/Workflow/KanbanSkeleton",
  component: ProjectKanbanSkeletonComponent,
  render: (args: ProjectKanbanSkeletonComponent) => ({
    props: {
      ...args,
    },
    template: `<app-project-kanban-skeleton ${argsToTemplate(args)}></app-project-kanban-skeleton>`,
  }),
};

export default meta;
type Story = StoryObj<ProjectKanbanSkeletonComponent>;

export const Default: Story = {
  args: {},
};
