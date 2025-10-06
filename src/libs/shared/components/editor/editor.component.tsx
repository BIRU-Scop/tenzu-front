import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  viewChild,
} from "@angular/core";
import * as React from "react";

import { createRoot, Root } from "react-dom/client";
import { Block, BlockNoteEditor } from "@blocknote/core";
import { codeBlock } from "@blocknote/code-block";

import { BlockNoteView } from "@blocknote/mantine";

@Component({
  selector: "app-editor-block",
  template: `<div #editor></div>`,
})
export class EditorComponent implements OnChanges, OnDestroy, AfterViewInit {
  elm = viewChild<ElementRef>("editor");
  disabled = input(false);
  resolveFileUrl = input<(url: string) => Promise<string>>();
  uploadFile = input.required<
    | undefined
    | ((
        file: File,
        blockId?: string | undefined,
      ) => Promise<string | Record<string, any>>)
  >();
  data = input<string>();
  private root?: Root;
  private editor?: BlockNoteEditor;
  constructor() {
    effect(() => {
      const data = this.data();
      const initialContent = data
        ? { initialContent: JSON.parse(data) as Block[] }
        : {};
      if (!this.editor) {
        this.editor = BlockNoteEditor.create({
          codeBlock,
          resolveFileUrl: this.resolveFileUrl(),
          uploadFile: this.uploadFile(),
          ...initialContent,
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

  public save() {
    return this.editor?.document;
  }
  public undo() {
    this.editor?.undo();
  }
  private render() {
    if (this.root && this.editor) {
      this.root.render(
        <React.StrictMode>
          <BlockNoteView editor={this.editor} editable={!this.disabled()} />
        </React.StrictMode>,
      );
    }
  }
}
