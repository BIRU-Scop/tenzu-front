import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  model,
  OnChanges,
  OnDestroy,
  output,
  SimpleChanges,
  viewChild,
} from "@angular/core";
import * as React from "react";

import { createRoot, Root } from "react-dom/client";
import { BlockNoteEditor, createCodeBlockSpec } from "@blocknote/core";
import { codeBlockOptions } from "@blocknote/code-block";

import { BlockNoteView } from "@blocknote/mantine";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import { HttpClient } from "@angular/common/http";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";

import { User } from "@tenzu/repository/user";
import { COLORS } from "@tenzu/pipes/color-to-key.pipe";
import { resolveFileUrl } from "@tenzu/shared/components/editor/utils";

@Component({
  selector: "app-editor-collaboration-block",
  template: ` <div
    (keydown.control.enter)="validate.emit()"
    (keydown.meta.enter)="validate.emit()"
    [class.disabled-editor]="disabled()"
    [class.readonly-editor]="readonly()"
    #editor
  ></div>`,
  host: {
    class: "editor",
  },
  styles: ``,
})
export class EditorCollaborationComponent
  implements OnChanges, OnDestroy, AfterViewInit
{
  httpClient = inject(HttpClient);
  configAppService = inject(ConfigAppService);

  elm = viewChild<ElementRef>("editor");
  disabled = input(false);
  readonly = input(false);
  touched = model(false);
  resolveFileUrl = resolveFileUrl();
  wsProvider = input.required<WebsocketProvider>();
  doc = input.required<Y.Doc>();
  user = input.required<User>();
  uploadFile = input.required<
    | undefined
    | ((
        file: File,
        blockId?: string | undefined,
      ) => Promise<string | Record<string, any>>)
  >();
  focus = input(true);
  validate = output();
  private root?: Root;
  private editor?: BlockNoteEditor;
  constructor() {
    const codeBlock = createCodeBlockSpec(codeBlockOptions);
    const focus = this.focus();
    effect(() => {
      const user = this.user();
      const wsProvider = this.wsProvider();
      const doc = this.doc();
      const fragment = doc.getXmlFragment("document-store");

      doc.on("update", (update, origin) => {
        // If the origin is null or is not the websocket provider,
        // it means it's a local modification made via the editor.
        if (origin !== wsProvider && !this.touched()) {
          this.touched.set(true);
        }
      });
      if (!this.editor) {
        this.editor = BlockNoteEditor.create({
          codeBlock,
          resolveFileUrl: this.resolveFileUrl,
          uploadFile: this.uploadFile(),
          autofocus: focus,
          collaboration: {
            provider: wsProvider,
            fragment: fragment,
            user: {
              name: user.fullName,
              color: COLORS[user.color],
            },
          },
        });
      }
      const elm = this.elm();
      if (!this.root && elm) {
        this.root = createRoot(elm.nativeElement);
      }
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.render();
  }

  ngAfterViewInit() {
    this.render();
  }

  ngOnDestroy() {
    if (this.root) {
      this.root.unmount();
    }
  }
  undo() {
    this.editor?.undo();
  }
  public get jsonContent() {
    return JSON.stringify(this.editor?.document);
  }

  public enableAndFocus() {
    if (this.editor) {
      this.editor.isEditable = true;
      this.editor.focus();
    }
  }
  public isEmpty() {
    return this.editor?.isEmpty;
  }
  private render() {
    const editable = !this.readonly();
    if (this.root && this.editor) {
      this.root.render(
        <BlockNoteView editor={this.editor} editable={editable} />,
      );
    }
  }
}
