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
import { UserCardComponent } from "../../libs/shared/components/user-card/user-card";
import { provideHttpClient } from "@angular/common/http";
import { provideTransloco } from "@jsverse/transloco";
import { isDevMode } from "@angular/core";
import { TranslocoHttpLoaderService } from "../../libs/utils/services/transloco-http-loader/transloco-http-loader.service";

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
