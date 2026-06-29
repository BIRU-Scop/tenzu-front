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

import { z } from "zod/v4";

const optionalDate = z.iso
  .datetime({ offset: true })
  .nullable()
  .transform((value) => value ?? undefined)
  .optional();

const feedItemBase = {
  id: z.string(),
  title: z.string(),
  content: z.string(),
  publicationDate: z.iso.datetime({ offset: true }),
  expirationDate: optionalDate,
  readAt: optionalDate,
};

const callToActionFeedItemSchema = z.object({
  ...feedItemBase,
  type: z.literal("call_to_action"),
  actionTitle: z.string().min(1),
  actionUrl: z.url({ protocol: /^https?$/ }),
});

const passiveFeedItemSchema = z
  .object({
    ...feedItemBase,
    type: z.enum(["maintenance", "release"]),
    actionTitle: z.string(),
    actionUrl: z.literal("").or(z.url({ protocol: /^https?$/ })),
  })
  .refine((item) => item.actionTitle.length > 0 === item.actionUrl.length > 0, {
    error: "actionTitle and actionUrl must be both set or both empty",
    path: ["actionUrl"],
  });

const feedItemSchema = z.discriminatedUnion("type", [callToActionFeedItemSchema, passiveFeedItemSchema]);

const feedItemReadStateSchema = z.object({
  id: z.string(),
  readAt: optionalDate,
});

export type FeedItem = z.infer<typeof feedItemSchema>;
export type FeedItemReadState = z.infer<typeof feedItemReadStateSchema>;

export function parseFeedItems(input: unknown): FeedItem[] {
  return z.array(feedItemSchema).parse(input);
}

export function parseFeedItemReadStates(input: unknown): FeedItemReadState[] {
  return z.array(feedItemReadStateSchema).parse(input);
}
