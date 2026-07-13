/*
 * Copyright (C) 2026 BIRU
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

import { Meta, moduleMetadata, StoryObj } from "@storybook/angular";
import { Component, signal } from "@angular/core";
import { withTransloco } from "../storybook-providers";
import { FeedItemCardComponent } from "../../app/home/feed/feed-item-card/feed-item-card.component";
import { FeedItem } from "@tenzu/repository/feed";
import { makeFeedItem } from "@tenzu/utils/testing/factories";

@Component({
  selector: "app-feed-item-card-storybook",
  standalone: true,
  imports: [FeedItemCardComponent],
  template: `
    <div class="flex max-w-3xl flex-col gap-8">
      <section class="flex flex-col gap-2">
        <h1>With action</h1>
        <app-feed-item-card [item]="withAction" (actionClicked)="onAction($event)" />
      </section>

      <section class="flex flex-col gap-2">
        <h1>Without action</h1>
        <app-feed-item-card [item]="withoutAction" />
      </section>

      @if (lastAction(); as id) {
        <p class="mat-body-small">Last action clicked: {{ id }}</p>
      }
    </div>
  `,
})
class StoryFeedItemCardStorybookComponent {
  readonly lastAction = signal<string | null>(null);

  readonly withAction: FeedItem = makeFeedItem({
    id: "feed-survey",
    type: "call_to_action",
    title: "Tenzu needs you!",
    content: "Help us make Tenzu the product that meets your needs by answering this **form**.",
    actionTitle: "I want to help improve Tenzu",
    actionUrl: "https://example.com/survey",
  });

  readonly withoutAction: FeedItem = makeFeedItem({
    id: "feed-maintenance",
    type: "maintenance",
    title: "Scheduled maintenance",
    content: "A **maintenance** is scheduled tonight. The app may be briefly unavailable.",
    actionTitle: "",
    actionUrl: "",
  });

  onAction(item: FeedItem): void {
    this.lastAction.set(item.id);
  }
}

type Story = StoryObj<StoryFeedItemCardStorybookComponent>;

const meta: Meta<StoryFeedItemCardStorybookComponent> = {
  component: StoryFeedItemCardStorybookComponent,
  title: "Components/Feed Item Card",
  decorators: [withTransloco, moduleMetadata({})],
};

export default meta;

export const Compositions: Story = {
  render: (args) => ({
    props: args,
    template: `<app-feed-item-card-storybook />`,
  }),
};
