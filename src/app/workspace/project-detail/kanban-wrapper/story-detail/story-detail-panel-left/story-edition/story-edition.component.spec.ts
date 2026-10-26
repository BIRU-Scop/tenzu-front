/*
 * Copyright (C) 2025-2026 BIRU
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

import { beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component, input, inputBinding, model, output, signal } from "@angular/core";

import { StoryEditionComponent } from "./story-edition.component";
import { StoryDetailFacade } from "../../story-detail.facade";
import { EditorCollaborationComponent } from "@tenzu/shared/components/editor";
import { WsDocProvider } from "@tenzu/utils/doc-provider";
import { TokenRepositoryService } from "@tenzu/repository/auth/token/token-repository.service";
import { makeTokens } from "@tenzu/repository/auth/auth.factories";
import { StoryAttachmentRepositoryService } from "@tenzu/repository/story-attachment/story-attachment-repository.service";
import { makeProjectDetail } from "@tenzu/repository/project/project.factories";
import { makeStoryDetail } from "@tenzu/repository/story/story.factories";
import { makeUser } from "@tenzu/repository/user/user.factories";
import { User } from "@tenzu/repository/user/user.model";
import { NotificationService } from "@tenzu/utils/services/notification";
import { testingProviders } from "@tenzu/utils/testing/testings-providers";
import { mockService } from "@tenzu/utils/testing/mocks";

@Component({ selector: "app-editor-collaboration-block", template: "" })
class EditorCollaborationStubComponent {
  wsDocProvider = input.required<WsDocProvider>();
  user = input.required<User>();
  uploadFile = input.required<unknown>();
  readonly = input(false);
  touched = model(false);
  validate = output();
  filedDeleted = output<string>();
  jsonContent = {};
}

describe(StoryEditionComponent.name, () => {
  let fixture: ComponentFixture<StoryEditionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        testingProviders,
        { provide: StoryDetailFacade, useValue: mockService(StoryDetailFacade) },
        { provide: StoryAttachmentRepositoryService, useValue: mockService(StoryAttachmentRepositoryService) },
        { provide: NotificationService, useValue: mockService(NotificationService) },
      ],
    });
    TestBed.overrideComponent(StoryEditionComponent, {
      remove: { imports: [EditorCollaborationComponent] },
      add: { imports: [EditorCollaborationStubComponent] },
    });
    TestBed.inject(TokenRepositoryService).set(makeTokens({ access: "access-token" }));
    fixture = TestBed.createComponent(StoryEditionComponent, {
      bindings: [
        inputBinding("project", signal(makeProjectDetail({ id: "project-1" }))),
        inputBinding("story", signal(makeStoryDetail({ projectId: "project-1", ref: 42 }))),
        inputBinding("user", signal(makeUser())),
      ],
    });
    fixture.detectChanges();
  });

  it("StoryEditionComponent creates its WsDocProvider with the access token of TokenRepositoryService", () => {
    expect(fixture.componentInstance.wsDocProvider().provider.url).toContain("token=access-token");
  });

  it("StoryEditionComponent calls cleanUp on its WsDocProvider when destroyed", () => {
    const cleanUp = vi.spyOn(WsDocProvider.prototype, "cleanUp");

    fixture.destroy();

    expect(cleanUp).toHaveBeenCalledOnce();
  });
});
