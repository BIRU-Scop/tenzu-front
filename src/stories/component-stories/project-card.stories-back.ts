/*
 * Copyright (C) 2024-2026 BIRU
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
import { ProjectCardComponent } from "../../libs/shared/components/project-card/project-card.component";
import { provideHttpClient } from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideTransloco } from "@jsverse/transloco";
import { isDevMode } from "@angular/core";
import { TranslocoHttpLoaderService } from "../../libs/utils/services/transloco-http-loader/transloco-http-loader.service";

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
            availableLangs: ["en-us"],
            defaultLang: "en-us",
            fallbackLang: "en-us",
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
