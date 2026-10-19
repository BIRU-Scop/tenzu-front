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

import { describe, expect, it } from "vitest";
import { ZodError } from "zod/v4";

import { createStoryTagPayloadSchema, StoryTagWithCount, storyTagWithCountSchema } from "./story-tag.model";
import { makeStoryTagWithCount } from "./story-tag.factories";

describe("storyTagWithCountSchema", () => {
  it("parses a conforming payload", () => {
    const raw = { ...makeStoryTagWithCount({ storiesCount: 4 }) };

    const parsed: StoryTagWithCount = storyTagWithCountSchema.parse(raw);

    expect(parsed).toEqual(raw);
  });

  it("throws on a non-conforming payload", () => {
    const raw = { ...makeStoryTagWithCount(), color: "red" };

    expect(() => storyTagWithCountSchema.parse(raw)).toThrow(ZodError);
  });

  it("canonicalizes and guards the create/update label", () => {
    const parsed = createStoryTagPayloadSchema.parse({ label: "  Cafe\u0301  ", color: 3 });
    expect(parsed.label).toBe("Café");

    expect(() => createStoryTagPayloadSchema.parse({ label: "   ", color: 3 })).toThrow(ZodError);
    expect(() => createStoryTagPayloadSchema.parse({ label: "bug\u200bfix", color: 3 })).toThrow(ZodError);
  });

  it("applies bounds", () => {
    const oversizedLabel = { ...makeStoryTagWithCount(), label: "x".repeat(51) };
    const outOfPaletteColor = { ...makeStoryTagWithCount(), color: 23 };

    expect(() => storyTagWithCountSchema.parse(oversizedLabel)).toThrow(ZodError);
    expect(() => storyTagWithCountSchema.parse(outOfPaletteColor)).toThrow(ZodError);
  });
});
