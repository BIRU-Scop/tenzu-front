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
import { HttpClient } from "@angular/common/http";
import { ConfigAppService } from "@tenzu/repository/config-app/config-app.service";

import { User } from "@tenzu/repository/user";
import { COLORS } from "@tenzu/pipes/color-to-key.pipe";
import { resolveFileUrl } from "@tenzu/shared/components/editor/utils";
import { WsDocProvider } from "@tenzu/utils/doc-provider";

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
  wsDocProvider = input.required<WsDocProvider>();
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
  already_done = false;
  filedDeleted = output<string>();
  constructor() {
    const codeBlock = createCodeBlockSpec(codeBlockOptions);
    const focus = this.focus();
    effect((onCleanup) => {
      if (this.already_done) return;
      this.already_done = true;
      const user = this.user();
      const wsDocProvider = this.wsDocProvider();
      const wsProvider = wsDocProvider.provider;
      if (!wsDocProvider.connected()) return;
      const doc = wsProvider.doc;
      const fragment = doc.getXmlFragment("document-store");

      doc.on("update", (update, origin) => {
        // If the origin is null or is not the websocket provider,
        // it means it's a local modification made via the editor.
        if (origin !== wsProvider && !this.touched()) {
          this.touched.set(true);
        }
      });
      if (!this.editor && wsDocProvider.connected()) {
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
              id: user.id,
            },
          },
        });
        this.editor.onChange((editor, { getChanges }) => {
          const changes = getChanges();
          for (const change of changes) {
            if (change.type === "delete" && change.block.type === "file") {
              this.filedDeleted.emit(change.block.props.url);
            }
          }
        }, false);
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
