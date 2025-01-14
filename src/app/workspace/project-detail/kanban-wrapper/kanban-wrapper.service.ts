import { inject, Injectable } from "@angular/core";
import { KanbanWrapperStore, StoryView } from "./kanban-wrapper.store";
import { StoryService } from "@tenzu/data/story";

@Injectable({
  providedIn: "root",
})
export class KanbanWrapperService {
  private kanbanWrapperStore = inject(KanbanWrapperStore);
  storyService = inject(StoryService);
  storyView = this.kanbanWrapperStore.storyView;
  firstOpened = this.kanbanWrapperStore.firstOpened;

  setStoryView(storyView: StoryView) {
    this.kanbanWrapperStore.setStoryView(storyView);
  }
  setFirstOpened(firstOpened: boolean) {
    this.kanbanWrapperStore.setFirstOpened(firstOpened);
  }
}
