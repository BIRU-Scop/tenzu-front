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

import { Component, inject, inputBinding, outputBinding, ViewContainerRef } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { NotificationService } from "@tenzu/utils/services/notification";
import { TranslocoDirective } from "@jsverse/transloco";
import { ButtonAddComponent } from "@tenzu/shared/components/ui/button/button-add.component";
import { ButtonDeleteComponent } from "@tenzu/shared/components/ui/button/button-delete.component";
import { ButtonEditComponent } from "@tenzu/shared/components/ui/button/button-edit.component";
import { ConfirmDirective } from "@tenzu/directives/confirm";
import { ProjectRepositoryService } from "@tenzu/repository/project/project-repository.service";
import { StoryTagRepositoryService } from "@tenzu/repository/story-tag/story-tag-repository.service";
import { StoryTagChipComponent } from "@tenzu/shared/components/story-tag-chip/story-tag-chip.component";
import { CreateStoryTagPayload, StoryTagWithCount } from "@tenzu/repository/story-tag/story-tag.model";
import { StoryTagDialogComponent } from "./story-tag-dialog.component";

@Component({
  selector: "app-list-tags",
  imports: [
    StoryTagChipComponent,
    ConfirmDirective,
    ButtonAddComponent,
    ButtonDeleteComponent,
    ButtonEditComponent,
    TranslocoDirective,
  ],
  template: `
    <div class="flex flex-col gap-4" *transloco="let t">
      <div class="flex justify-end">
        <app-button-add translocoKey="project.settings.attributes.tags.add" (click)="openCreateDialog()" />
      </div>

      @if (tags().length > 0) {
        <div class="app-table">
          <div class="app-table-row-group">
            @for (tag of tags(); track tag.id) {
              <div class="app-table-row">
                <div class="app-table-cell">
                  <app-story-tag-chip [tag]="tag" [noChip]="true" />
                </div>
                <div class="app-table-cell">
                  <span>{{ t("project.settings.attributes.tags.related_stories", { count: tag.storiesCount }) }}</span>
                </div>
                <div class="app-table-cell">
                  <app-button-edit
                    class="ml-auto"
                    [iconOnly]="true"
                    translocoKey="project.settings.attributes.tags.edit_aria"
                    [translocoValue]="{ label: tag.label }"
                    (click)="openEditDialog(tag)"
                  />
                  <app-button-delete
                    [iconOnly]="true"
                    translocoKey="project.settings.attributes.tags.delete_aria"
                    [translocoValue]="{ label: tag.label }"
                    appConfirm
                    [data]="{
                      deleteAction: true,
                      message: t(
                        tag.storiesCount > 0
                          ? 'project.settings.attributes.tags.delete_confirm_used'
                          : 'project.settings.attributes.tags.delete_confirm_unused',
                        {
                          label: tag.label,
                          count: tag.storiesCount,
                        }
                      ),
                    }"
                    (popupConfirm)="deleteTag(tag)"
                  />
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <p class="text-on-surface-variant">{{ t("project.settings.attributes.tags.empty_message") }}</p>
      }
    </div>
  `,
})
export default class ListTagsComponent {
  storyTagRepositoryService = inject(StoryTagRepositoryService);
  projectRepositoryService = inject(ProjectRepositoryService);
  matDialog = inject(MatDialog);
  notificationService = inject(NotificationService);
  viewContainerRef = inject(ViewContainerRef);
  tags = this.storyTagRepositoryService.entitiesSummary;

  openCreateDialog() {
    this.matDialog.open(StoryTagDialogComponent, {
      viewContainerRef: this.viewContainerRef,
      bindings: [
        outputBinding<CreateStoryTagPayload>("saved", (payload) => {
          const project = this.projectRepositoryService.entityDetail();
          if (!project) {
            return;
          }
          void this.storyTagRepositoryService
            .createRequest(payload, { projectId: project.id })
            .catch((error: unknown) => this.toastTagRefusal(error, payload.label));
        }),
      ],
    });
  }

  openEditDialog(tag: StoryTagWithCount) {
    this.matDialog.open(StoryTagDialogComponent, {
      viewContainerRef: this.viewContainerRef,
      bindings: [
        inputBinding("tag", () => tag),
        outputBinding<CreateStoryTagPayload>("saved", (payload) => {
          void this.storyTagRepositoryService
            .patchRequest(tag.id, payload, {
              tagId: tag.id,
            })
            .catch((error: unknown) => this.toastTagRefusal(error, payload.label));
        }),
      ],
    });
  }

  deleteTag(tag: StoryTagWithCount) {
    void this.storyTagRepositoryService
      .deleteRequest(tag, { tagId: tag.id })
      .catch((error: unknown) => this.toastGoneTag(error));
  }

  private toastGoneTag(error: unknown): void {
    if (error instanceof HttpErrorResponse && error.status === 404) {
      this.notificationService.error(
        { title: "project.settings.attributes.tags.errors.gone", translocoTitle: true },
        { duration: 5000 },
      );
      return;
    }
    throw error;
  }

  private toastTagRefusal(error: unknown, label: string): void {
    if (error instanceof HttpErrorResponse && error.status === 400) {
      // error.error can itself be null (body-less 400 from a gateway).
      const detail = (error.error as { error?: { detail?: string } } | null)?.error?.detail;
      if (detail === "story-tag-label-already-exists") {
        this.notificationService.error(
          {
            title: "project.settings.attributes.tags.errors.conflict",
            translocoTitle: true,
            translocoTitleParams: { label },
          },
          { duration: 5000 },
        );
        return;
      }
      if (detail === "max-story-tags-per-project-reached") {
        this.notificationService.error(
          { title: "project.settings.attributes.tags.errors.max_reached", translocoTitle: true },
          { duration: 5000 },
        );
        return;
      }
    }
    throw error;
  }
}
