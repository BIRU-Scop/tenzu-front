import { argsToTemplate, Meta, StoryObj } from "@storybook/angular";
import { AvatarComponent } from "./avatar.component";

const meta: Meta<AvatarComponent> = {
  title: "Components/Avatar",
  component: AvatarComponent,
  // waiting for https://github.com/storybookjs/storybook/issues/28412 to remove manual argTypes
  argTypes: {
    name: { type: "string" },
    rounded: { type: "boolean" },
    color: { type: "number" },
  },
};

export default meta;
type Story = StoryObj<AvatarComponent>;

export const WorkspaceAvatar: Story = {
  args: {
    name: "🐕 Dogs workspace",
    rounded: false,
    size: "sm",
    color: 2,
  },
};

export const ProjectCardAvatar: Story = {
  args: {
    name: "Awesome project",
    rounded: false,
    size: "md",
    color: 1,
  },
};

export const ProjectAvatar: Story = {
  args: {
    name: "Awesome project",
    rounded: false,
    size: "xl",
    color: 4,
  },
};

export const UserAvatar: Story = {
  args: {
    name: "Emeline",
    rounded: true,
    size: "md",
    color: 3,
  },
};

export const ButtonAvatar: Story = {
  args: {
    name: "Emeline",
    rounded: true,
    size: "md",
    color: 3,
  },
  render: (args) => ({
    props: args,
    template: `
    <button><app-avatar ${argsToTemplate(args)}/></button>`,
  }),
};
