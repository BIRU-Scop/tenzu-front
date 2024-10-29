import { applicationConfig, Meta, StoryObj } from "@storybook/angular";
import { UserCardComponent } from "./user-card";
import { provideHttpClient } from "@angular/common/http";
import { provideTransloco } from "@jsverse/transloco";
import { isDevMode } from "@angular/core";
import { TranslocoHttpLoaderService } from "@tenzu/utils/services";

const meta: Meta<UserCardComponent> = {
  title: "Components/UserCard",
  component: UserCardComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideHttpClient(),
        provideTransloco({
          config: {
            reRenderOnLangChange: true,
            prodMode: !isDevMode(),
            availableLangs: ["en-US"],
            defaultLang: "en-US",
            fallbackLang: "en-US",
            flatten: {
              aot: !isDevMode(),
            },
          },
          loader: TranslocoHttpLoaderService,
        }),
      ],
    }),
  ],
  // waiting for https://github.com/storybookjs/storybook/issues/28412 to remove manual argTypes
  argTypes: {
    fullName: { type: "string" },
    username: { type: "string" },
    color: { type: "number" },
    isSelf: { type: "boolean" },
    textToHighlight: { type: "string" },
  },
};

export default meta;
type Story = StoryObj<UserCardComponent>;

export const NoRegistered: Story = {
  args: {
    username: "test@bidule.fr",
  },
};

export const Registered: Story = {
  args: {
    fullName: "Emeline Gaube",
    username: "@egaube",
    color: 2,
  },
};

export const CurrentUser: Story = {
  args: {
    fullName: "Paul Guichon",
    username: "@pguichon",
    color: 3,
    isSelf: true,
  },
};

export const SearchResult: Story = {
  args: {
    fullName: "Julie Rymer",
    username: "@jrymer",
    color: 4,
    textToHighlight: "ry",
  },
};
