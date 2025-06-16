/*
 * Copyright (C) 2025 BIRU
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

import { inject, Injectable } from "@angular/core";
import { KanbanWrapperStore, StoryView } from "./kanban-wrapper.store";
import { StoryDetail, StoryRepositoryService } from "@tenzu/repository/story";

@Injectable({
  providedIn: "root",
})
export class KanbanWrapperService {
  private kanbanWrapperStore = inject(KanbanWrapperStore);
  storyRepositoryService = inject(StoryRepositoryService);
  storyView = this.kanbanWrapperStore.storyView;
  firstOpened = this.kanbanWrapperStore.firstOpened;
  isOpenedSideview = this.kanbanWrapperStore.isOpenedSideview;
  setStoryView(storyView: StoryView) {
    this.kanbanWrapperStore.setStoryView(storyView);
  }
  setFirstOpened(firstOpened: boolean) {
    this.kanbanWrapperStore.setFirstOpened(firstOpened);
  }

  setOpenedSideview(storyDetail?: StoryDetail) {
    const isOpenedSideview = this.kanbanWrapperStore.isOpenedSideview();
    if (storyDetail && !isOpenedSideview) {
      this.openOpenedSideview();
    }
  }
  closeOpenedSideview() {
    this.kanbanWrapperStore.setSidenavStoryViewOpened(false);
  }
  openOpenedSideview() {
    this.kanbanWrapperStore.setSidenavStoryViewOpened(true);
  }
}
