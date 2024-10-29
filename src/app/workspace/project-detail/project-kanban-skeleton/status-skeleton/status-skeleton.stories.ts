import type { Meta, StoryObj } from "@storybook/angular";
import { argsToTemplate } from "@storybook/angular";
import { StatusSkeletonComponent } from "./status-skeleton.component";

const meta: Meta<StatusSkeletonComponent> = {
  title: "Components/Skeletons/Workflow/StatusSkeleton",
  component: StatusSkeletonComponent,
  render: (args: StatusSkeletonComponent) => ({
    props: {
      ...args,
    },
    template: `<app-status-skeleton ${argsToTemplate(args)}></app-status-skeleton>`,
  }),
};

export default meta;
type Story = StoryObj<StatusSkeletonComponent>;

export const Default: Story = {
  args: {},
};
