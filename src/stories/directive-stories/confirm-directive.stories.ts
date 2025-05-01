/*
 * Copyright (C) 2024-2025 BIRU
 *
 * This file is part of Tenzu.
 *
 * Tenzu is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * You can contact BIRU at ask@biru.sh
 *
 */

import { applicationConfig, Meta, StoryObj } from "@storybook/angular";
import { JsonPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, input, isDevMode } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideTransloco } from "@jsverse/transloco";
import { TranslocoHttpLoaderService } from "../../libs/utils/services/transloco-http-loader/transloco-http-loader.service";
import { provideHttpClient } from "@angular/common/http";
import { ConfirmDirective, ConfirmPopupData } from "../../libs/shared/directives/confirm/confirm.directive";
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
