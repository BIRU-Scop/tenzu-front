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
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from "@ngrx/signals";
import { computed, inject } from "@angular/core";
import { Router } from "@angular/router";

/**
 * Controls how the story detail should be displayed in the UI.
 * - modalView: story opened in a dialog/modal
 * - fullView: dedicated page/route view
 * - sideView: story displayed in a side panel
 */
export type StoryDisplayMode = "modalView" | "fullView" | "sideView";

type KanbanWrapperState = {
  storyDisplayMode: StoryDisplayMode;
};

const DEFAULT_STORY_DISPLAY_MODE: StoryDisplayMode = "modalView";

const STORY_DISPLAY_MODE_STORAGE_KEY = "storyModeView";

const KANBAN_ROUTE_RE = /^\/workspace\/[^/]+\/project\/[^/]+\/kanban\/[^/]+$/;
const STORY_ROUTE_RE = /^\/workspace\/[^/]+\/project\/[^/]+\/story\/[^/]+$/;

function getLastSuccessfulUrl(router: Router): string | null {
  const nav = router.lastSuccessfulNavigation();
  if (!nav) return null;
  return nav.finalUrl?.toString() ?? nav.extractedUrl.toString();
}

function matchesRoute(router: Router, routeRe: RegExp): boolean {
  const url = getLastSuccessfulUrl(router);
  return url ? routeRe.test(url) : false;
}

export const KanbanWrapperStore = signalStore(
  { providedIn: "root" },
  withState<KanbanWrapperState>({
    storyDisplayMode: DEFAULT_STORY_DISPLAY_MODE,
  }),
  withComputed((store) => {
    const router = inject(Router);

    // High-level route context (kanban vs story detail route)
    const isKanbanView = computed(() => matchesRoute(router, KANBAN_ROUTE_RE));
    const isStoryView = computed(() => matchesRoute(router, STORY_ROUTE_RE));
    /**
     * Factory that creates a computed "is open" flag for a given display mode.
     * This avoids repeating: isStoryView() && storyDisplayMode() === "..."
     */
    const isStoryModeOpen = (mode: StoryDisplayMode) =>
      computed(() => isStoryView() && store.storyDisplayMode() === mode);

    // Derived UI flags used by components to decide what to render
    const isFullViewOpen = isStoryModeOpen("fullView");
    const isModalViewOpen = isStoryModeOpen("modalView");
    const isSideViewOpen = isStoryModeOpen("sideView");

    return { isKanbanView, isStoryView, isFullViewOpen, isModalViewOpen, isSideViewOpen };
  }),
  withMethods((store) => ({
    setStoryDisplayMode(mode: StoryDisplayMode) {
      patchState(store, { storyDisplayMode: mode });
      localStorage.setItem(STORY_DISPLAY_MODE_STORAGE_KEY, mode);
    },
  })),
  withHooks({
    onInit(store) {
      const storedMode = localStorage.getItem(STORY_DISPLAY_MODE_STORAGE_KEY) as StoryDisplayMode | null;
      store.setStoryDisplayMode(storedMode ?? DEFAULT_STORY_DISPLAY_MODE);
    },
  }),
);
