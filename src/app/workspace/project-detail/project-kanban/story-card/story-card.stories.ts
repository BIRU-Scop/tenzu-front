import { applicationConfig, Meta, StoryObj } from "@storybook/angular";

import { provideAnimations } from "@angular/platform-browser/animations";
import { ChangeDetectionStrategy, Component, input, isDevMode } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { provideTransloco } from "@jsverse/transloco";
import { TranslocoHttpLoaderService } from "@tenzu/utils/services";
import { StoryCardComponent } from "./story-card.component";
import { provideRouter } from "@angular/router";

@Component({
  selector: "app-routing-component-test",
  template: ``,
  standalone: true,
})
class RoutingTestComponent {}

@Component({
  selector: "app-storybook-story-card",
  standalone: true,
  imports: [StoryCardComponent],
  template: ` <app-story-card [title]="title()" [ref]="ref()" [users]="users()"></app-story-card> `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StorybookStoryCardComponent {
  title = input.required<string>();
  ref = input.required<number>();
  users = input.required<Array<{ fullName: string; color: number }>>();
}

type Story = StoryObj<StorybookStoryCardComponent>;

const meta: Meta<StorybookStoryCardComponent> = {
  title: "Components/StoryCard",
  component: StorybookStoryCardComponent,
  args: {
    title: "My story title",
    ref: 5,
    users: [
      { fullName: "John Doe", color: 3 },
      { fullName: "Martha Roberts", color: 2 },
    ],
  },
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([
          {
            path: "**",
            component: RoutingTestComponent,
          },
        ]),
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
};

export const ThreePeopleOrLess: Story = {
  args: {
    title: "My story title",
    ref: 87,
    users: [
      { fullName: "John Doe", color: 3 },
      { fullName: "Martha Roberts", color: 2 },
      { fullName: "Yvette Collins", color: 4 },
    ],
  },
};

export const MoreThan3People: Story = {
  args: {
    title: "My story title",
    ref: 454,
    users: [
      { fullName: "John Doe", color: 3 },
      { fullName: "Martha Roberts", color: 2 },
      { fullName: "Yvette Collins", color: 4 },
      { fullName: "Feldspar RockMan", color: 1 },
      { fullName: "Benjamin Rodriguez", color: 4 },
      { fullName: "Paul Hochon", color: 6 },
    ],
  },
};

export const HugeTitle: Story = {
  args: {
    title: "HA".repeat(200),
    ref: 5418,
    users: [
      { fullName: "John Doe", color: 3 },
      { fullName: "Martha Roberts", color: 2 },
      { fullName: "Yvette Collins", color: 4 },
      { fullName: "Feldspar RockMan", color: 1 },
    ],
  },
};

export default meta;