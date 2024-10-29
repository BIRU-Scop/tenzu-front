import type { Meta, StoryObj } from "@storybook/angular";
import { argsToTemplate } from "@storybook/angular";
import { StorySkeletonComponent } from "./story-skeleton.component";

const meta: Meta<StorySkeletonComponent> = {
  title: "Components/Skeletons/Workflow/StorySkeleton",
  component: StorySkeletonComponent,
  render: (args: StorySkeletonComponent) => ({
    props: {
      ...args,
    },
    template: `<app-story-skeleton ${argsToTemplate(args)}></app-story-skeleton>`,
  }),
};

export default meta;
type Story = StoryObj<StorySkeletonComponent>;

export const Default: Story = {
  args: {},
};
