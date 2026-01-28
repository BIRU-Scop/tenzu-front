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
  effect,
  inject,
  input,
  linkedSignal,
  model,
  viewChild,
} from "@angular/core";
import { ButtonSaveComponent } from "@tenzu/shared/components/ui/button/button-save.component";
import { ButtonUndoComponent } from "@tenzu/shared/components/ui/button/button-undo.component";
import { EditorCollaborationComponent } from "@tenzu/shared/components/editor";
import { FormFooterComponent } from "@tenzu/shared/components/ui/form-footer/form-footer.component";
import { MatFormField, MatInput } from "@angular/material/input";
import { TranslocoDirective } from "@jsverse/transloco";
import { ProjectDetail } from "@tenzu/repository/project";
import { StoryDetail } from "@tenzu/repository/story";
import { form, FormField, readonly, submit } from "@angular/forms/signals";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { AuthService } from "@tenzu/repository/auth";
import { StoryDetailFacade } from "../../story-detail.facade";
import { StoryAttachmentRepositoryService } from "@tenzu/repository/story-attachment";
import { hasEntityRequiredPermission } from "@tenzu/repository/permission/permission.service";
import { ProjectPermissions } from "@tenzu/repository/permission/permission.model";
import { NotificationService } from "@tenzu/utils/services/notification";
import { HttpClient } from "@angular/common/http";
import { User } from "@tenzu/repository/user";
import { ColorToKeyPipe } from "@tenzu/pipes/color-to-key.pipe";
import { AvatarComponent } from "@tenzu/shared/components/avatar";
import { WsDocProvider } from "@tenzu/utils/doc-provider";

@Component({
  selector: "app-story-edition",
  imports: [
    ButtonSaveComponent,
    ButtonUndoComponent,
    EditorCollaborationComponent,
    FormFooterComponent,
    MatFormField,
    MatInput,
    TranslocoDirective,
    FormField,
    AvatarComponent,
    ColorToKeyPipe,
  ],
  template: `
    @let _user = user();
    @let _story = story();

    <div class="flex flex-row gap-2 mb-2 min-h-8 justify-end">
      @if (onlineUsers().length > 1) {
        @for (user of onlineUsers(); track user.id) {
          <app-avatar [name]="user.name" [color]="user.color | colorToKey" [rounded]="true" />
        }
      }
    </div>

    <form *transloco="let t" class="flex flex-col h-full gap-4">
      <mat-form-field appearance="fill" class="title-field">
        <input [attr.aria-label]="t('workflow.detail_story.title')" matInput [formField]="storyForm.title" />
      </mat-form-field>
      @if (_user.fullName && wsDocProvider().connected()) {
        <app-editor-collaboration-block
          class="overflow-auto"
          [wsDocProvider]="wsDocProvider()"
          [uploadFile]="uploadFile(_story)"
          [user]="_user"
          [(touched)]="touched"
          (validate)="save()"
          [readonly]="!hasModifyPermission()"
          #editorContainer
        />
      }

      @if (hasModifyPermission()) {
        <app-form-footer>
          <app-button-undo
            appFormFooterSecondaryAction
            (click)="undo()"
            [disabled]="!(touched() || storyForm().dirty())"
          />
          <app-button-save (click)="save($event)" [disabled]="!(touched() || storyForm().dirty())" />
        </app-form-footer>
      }
    </form>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryEditionComponent {
  httpClient = inject(HttpClient);
  editor = viewChild.required<EditorCollaborationComponent>("editorContainer");
  project = input.required<ProjectDetail>();
  story = input.required<StoryDetail>();
  touched = model(false);
  user = input.required<User>();
  storyModel = linkedSignal(() => ({ title: this.story().title }));

  notificationService = inject(NotificationService);
  configAppService = inject(ConfigAppService);
  authService = inject(AuthService);
  storyDetailFacade = inject(StoryDetailFacade);
  storyAttachmentRepositoryService = inject(StoryAttachmentRepositoryService);
  hasModifyPermission = computed(() =>
    hasEntityRequiredPermission({
      requiredPermission: ProjectPermissions.MODIFY_STORY,
      actualEntity: this.project(),
    }),
  );
  storyForm = form(this.storyModel, (schemaPath) => {
    readonly(schemaPath.title, () => !this.hasModifyPermission());
  });

  wsDocProvider = computed(() => {
    return new WsDocProvider({
      serverUrl: `${this.configAppService.wsUrl()}/collaboration/${this.story().projectId}/`,
      roomName: `${this.story().ref}?token=${this.authService.getToken().access}`,
    });
  });
  onlineUsers = computed(() => this.wsDocProvider().onlineUsers());

  constructor() {
    effect((onCleanup) => {
      const wsDocProvider = this.wsDocProvider();
      onCleanup(() => {
        wsDocProvider.cleanUp();
      });
    });
  }
  async save(event?: Event) {
    event?.preventDefault();
    this.wsDocProvider().save();
    await submit(this.storyForm, async (form) => {
      const data = {
        ...form().value(),
        description: this.editor().jsonContent,
      };
      await this.storyDetailFacade.patchSelectedStory(data);
      this.touched.set(false);
      this.storyForm().reset();
      this.notificationService.success({ title: "notification.action.changes_saved" });
    });
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

  undo() {
    this.editor().undo();
    this.storyForm().reset();
    this.storyModel.set({ title: this.story().title });
  }
}
