import { applicationConfig, Meta, StoryObj } from "@storybook/angular";
import { ProjectCardComponent } from "./project-card.component";
import { provideHttpClient } from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideTransloco } from "@jsverse/transloco";
import { isDevMode } from "@angular/core";
import { TranslocoHttpLoaderService } from "@tenzu/utils/services";

const meta: Meta<ProjectCardComponent> = {
  title: "Components/ProjectCard",
  component: ProjectCardComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideHttpClient(),
        provideAnimations(),
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
    name: { type: "string" },
    description: { type: "string" },
    color: { type: "number" },
  },
};

export default meta;
type Story = StoryObj<ProjectCardComponent>;

export const Default: Story = {
  args: {
    name: "🐕 Dog Dating",
    description: "Find the perfect match for your dog",
    color: 2,
  },
};
