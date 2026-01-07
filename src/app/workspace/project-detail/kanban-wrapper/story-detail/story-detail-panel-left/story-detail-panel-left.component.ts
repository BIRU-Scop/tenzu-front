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

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  viewChild,
} from "@angular/core";
import { ButtonSaveComponent } from "@tenzu/shared/components/ui/button/button-save.component";
import { ButtonUndoComponent } from "@tenzu/shared/components/ui/button/button-undo.component";
import { EditorComponent } from "@tenzu/shared/components/editor";
import { HasPermissionDirective } from "@tenzu/directives/permission.directive";
import { MatDivider } from "@angular/material/list";
import { MatFormField, MatInput } from "@angular/material/input";
import { StoryDetailCommentsComponent } from "./story-detail-comments/story-detail-comments.component";
import { ProjectPermissions } from "@tenzu/repository/permission/permission.model";
import { hasEntityRequiredPermission } from "@tenzu/repository/permission/permission.service";
import { ProjectDetail } from "@tenzu/repository/project";
import { StoryDetail } from "@tenzu/repository/story";
import { NotificationService } from "@tenzu/utils/services/notification";
import { StoryDetailFacade } from "../story-detail.facade";
import { lastValueFrom } from "rxjs";
import { StoryAttachmentRepositoryService } from "@tenzu/repository/story-attachment";
import { HttpClient } from "@angular/common/http";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { TranslocoDirective } from "@jsverse/transloco";
import { disabled, Field, form, submit } from "@angular/forms/signals";
import {
  FormFooterComponent,
  FormFooterSecondaryActionDirective,
} from "@tenzu/shared/components/ui/form-footer/form-footer.component";

@Component({
  selector: "app-story-detail-panel-left",
  imports: [
    ButtonSaveComponent,
    ButtonUndoComponent,
    EditorComponent,
    HasPermissionDirective,
    MatDivider,
    MatFormField,
    MatInput,
    StoryDetailCommentsComponent,
    TranslocoDirective,
    Field,
    FormFooterComponent,
    FormFooterSecondaryActionDirective,
  ],
  template: `
    @let _project = project();
    @let _story = story();
    <form *transloco="let t" class="flex flex-col h-full gap-4">
      <mat-form-field appearance="fill" class="title-field">
        <input [attr.aria-label]="t('workflow.detail_story.title')" matInput [field]="storyForm.title" />
      </mat-form-field>
      <app-editor-block
        class="overflow-auto"
        [data]="_story.description"
        [resolveFileUrl]="resolveFileUrl()"
        [uploadFile]="uploadFile(_story)"
        [disabled]="!hasModifyPermission()"
        (validate)="save()"
        #editorContainer
      />
      @if (hasModifyPermission()) {
        <app-form-footer>
          <app-button-undo appFormFooterSecondaryAction (click)="undo()" />
          <app-button-save (click)="save($event)" />
        </app-form-footer>
      }
    </form>
    <mat-divider />
    <app-story-detail-comments
      *appHasPermission="{
        actualEntity: _project,
        requiredPermission: ProjectPermissions.VIEW_COMMENT,
      }"
      class="pb-4"
      [projectDetail]="_project"
      [storyDetail]="_story"
    />
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryDetailPanelLeftComponent {
  protected readonly ProjectPermissions = ProjectPermissions;
  project = input.required<ProjectDetail>();
  story = input.required<StoryDetail>();
  storyModel = linkedSignal(() => ({ title: this.story().title }));
  editor = viewChild.required<EditorComponent>("editorContainer");
  notificationService = inject(NotificationService);
  storyDetailFacade = inject(StoryDetailFacade);
  storyAttachmentRepositoryService = inject(StoryAttachmentRepositoryService);
  httpClient = inject(HttpClient);
  configAppService = inject(ConfigAppService);
  closed = output<void>();

  hasModifyPermission = computed(() =>
    hasEntityRequiredPermission({
      requiredPermission: ProjectPermissions.MODIFY_STORY,
      actualEntity: this.project(),
    }),
  );

  storyForm = form(this.storyModel, (schemaPath) => {
    disabled(schemaPath.title, () => !this.hasModifyPermission());
  });

  async save(event?: Event) {
    event?.preventDefault();
    await submit(this.storyForm, async (form) => {
      const data = form().value();
      await this.storyDetailFacade.patchSelectedStory({ ...data, description: this.editor().jsonContent });
      this.notificationService.success({ title: "notification.action.changes_saved" });
    });
  }
  undo() {
    this.editor().undo();
    this.storyForm().reset();
    this.storyModel.set({ title: this.story().title });
  }

  resolveFileUrl() {
    const httpClient = this.httpClient;
    const baseUrl = this.configAppService.apiUrl();
    return async (url: string) => {
      if (!url.startsWith(baseUrl)) {
        return url;
      }
      const file = await lastValueFrom(httpClient.get(url, { responseType: "blob" }));
      return URL.createObjectURL(file);
    };
  }
  uploadFile(storyDetail: StoryDetail) {
    const storyAttachmentRepositoryService = this.storyAttachmentRepositoryService;
    const baseUrl = this.configAppService.apiUrl();
    return async (file: File) => {
      const attachment = await storyAttachmentRepositoryService.createAttachment(file, {
        ref: storyDetail.ref,
        projectId: storyDetail.projectId,
      });
      return `${baseUrl}/stories/attachments/${attachment.id}`;
    };
  }
}
