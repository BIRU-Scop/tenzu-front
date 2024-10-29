import type { Meta, StoryObj } from "@storybook/angular";
import { argsToTemplate } from "@storybook/angular";
import { CardSkeletonComponent } from "./card-skeleton.component";

const meta: Meta<CardSkeletonComponent> = {
  title: "Components/Skeletons/CardSkeleton",
  component: CardSkeletonComponent,
  render: (args: CardSkeletonComponent) => ({
    props: {
      ...args,
    },
    template: `<app-card-skeleton ${argsToTemplate(args)}></app-card-skeleton>`,
  }),
};

export default meta;
type Story = StoryObj<CardSkeletonComponent>;

export const Default: Story = {
  args: {},
};
