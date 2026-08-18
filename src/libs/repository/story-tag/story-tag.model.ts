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
import type { AssertTrue, MutuallyAssignable } from "../base/type-assertions";

/** Size of the tag color palette (`tag-color-1…N` classes in _colors.scss / _tag-colors.scss). */
export const TAG_COLOR_COUNT = 20;

export const storyTagSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  label: z.string().min(1).max(50),
  color: z.int().min(1).max(TAG_COLOR_COUNT),
});
export type StoryTag = z.infer<typeof storyTagSchema>;

export const storyTagWithCountSchema = storyTagSchema.extend({
  storiesCount: z.int(),
});
export type StoryTagWithCount = z.infer<typeof storyTagWithCountSchema>;

export const createStoryTagLabelSchema = z
  .string()
  .trim()
  .normalize("NFC")
  .min(1)
  .max(50)
  .refine((value) => !/[\p{Cc}\p{Cf}]/u.test(value), "invalid_characters");

export const createStoryTagPayloadSchema = storyTagSchema.omit({ id: true, projectId: true }).extend({
  label: createStoryTagLabelSchema,
});
export type CreateStoryTagPayload = z.infer<typeof createStoryTagPayloadSchema>;

// Compile-time tripwire: the payload must stay structurally identical to the
// entity minus the server-owned `id`.
export type _PayloadStaysInSyncWithEntity = AssertTrue<MutuallyAssignable<CreateStoryTagPayload, Omit<StoryTag, "id">>>;

export const storyTagEventContentSchema = z.object({
  storyTag: storyTagWithCountSchema,
});
