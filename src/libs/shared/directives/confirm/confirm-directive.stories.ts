import { applicationConfig, Meta, StoryObj } from "@storybook/angular";
import { JsonPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, input, isDevMode } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideTransloco } from "@jsverse/transloco";
import { TranslocoHttpLoaderService } from "@tenzu/utils/services";
import { provideHttpClient } from "@angular/common/http";
import { ConfirmDirective, ConfirmPopupData } from "./confirm.directive";
import { MatButton } from "@angular/material/button";

type Story = StoryObj<ConfirmStoryComponent>;

@Component({
  selector: "app-confirm-dialog-story-example",
  standalone: true,
  imports: [ReactiveFormsModule, ConfirmDirective, JsonPipe, MatButton],
  template: `C'est un example`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ConfirmStoryExampleComponent {}

@Component({
  selector: "app-confirm-dialog-story-example",
  standalone: true,
  imports: [ReactiveFormsModule, ConfirmDirective, JsonPipe, MatButton],
  template: ` <button mat-button appConfirm [data]="data()">click me</button> `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ConfirmStoryComponent {
  data = input<ConfirmPopupData>({ deleteAction: false });
}

const meta: Meta<ConfirmStoryComponent> = {
  component: ConfirmStoryComponent,
  title: "Directive/ConfirmDirective",
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
};

export const ConfirmDirectiveStory: Story = {};
export const ConfirmWithCustomDirectiveStory: Story = {
  args: {
    data: {
      component: ConfirmStoryExampleComponent,
      deleteAction: false,
    },
  },
};
export const ConfirmDeleteActionDirectiveStory: Story = {
  args: {
    data: {
      deleteAction: true,
    },
  },
};

export default meta;
