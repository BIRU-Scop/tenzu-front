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
  signal,
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
import { FormField, form, readonly, submit } from "@angular/forms/signals";
import * as Y from "yjs";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";
import { AuthService } from "@tenzu/repository/auth";
import { StoryDetailFacade } from "../../story-detail.facade";
import { StoryAttachmentRepositoryService } from "@tenzu/repository/story-attachment";
import { hasEntityRequiredPermission } from "@tenzu/repository/permission/permission.service";
import { ProjectPermissions } from "@tenzu/repository/permission/permission.model";
import { NotificationService } from "@tenzu/utils/services/notification";
import { HttpClient } from "@angular/common/http";
import { initWsDocProvider } from "./utils";
import { User } from "@tenzu/repository/user";
import { COLORS } from "@tenzu/pipes/color-to-key.pipe";

type OnlineUser = {
  clientId: string;
  name: string;
  color: string;
};

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
  ],
  template: `
    @let _user = user();
    @let _story = story();
    <!--    @if (onlineUsers().length > 1) {-->
    <!--      <div class="flex flex-row gap-2 items-center">-->
    <!--        @for (user of onlineUsers(); track user.clientId) {-->
    <!--          <app-avatar [name]="user.name" [color]="user.color | colorToKey" [rounded]="true" />-->
    <!--        }-->
    <!--      </div>-->
    <!--    }-->

    <form *transloco="let t" class="flex flex-col h-full gap-4">
      <mat-form-field appearance="fill" class="title-field">
        <input [attr.aria-label]="t('workflow.detail_story.title')" matInput [formField]="storyForm.title" />
      </mat-form-field>

      @if (_user.fullName) {
        <app-editor-collaboration-block
          class="overflow-auto"
          [wsProvider]="wsProvider()"
          [uploadFile]="uploadFile(_story)"
          [doc]="doc()"
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
  onlineUsers = signal<OnlineUser[]>([]);
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

  doc = computed(() => new Y.Doc());
  wsProvider = computed(() => {
    return initWsDocProvider({
      serverUrl: `${this.configAppService.wsUrl()}/collaboration/${this.story().projectId}/`,
      roomName: `${this.story().ref}?token=${this.authService.getToken().access}`,
      doc: this.doc(),
    });
  });

  constructor() {
    effect(() => {
      const user = this.user();
      const wsProvider = this.wsProvider();

      wsProvider.awareness.setLocalStateField("user", {
        clientId: wsProvider.awareness.clientID,
        name: user.fullName,
        color: COLORS[user.color],
      });
      const handleAwarenessUpdate = () => {
        const states = wsProvider.awareness.getStates();
        const users = [] as OnlineUser[];

        states.forEach((state, clientId) => {
          if (state["user"]) {
            const user = { ...state["user"], clientId } as OnlineUser;
            users.push(user);
          }
        });

        this.onlineUsers.set(users);
      };
      wsProvider.awareness.on("change", handleAwarenessUpdate);
    });
  }
  async save(event?: Event) {
    event?.preventDefault();
    const wsProvider = this.wsProvider();
    if (wsProvider.wsconnected) {
      wsProvider.ws?.send(
        JSON.stringify({
          command: "save_now",
        }),
      );
    }
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
