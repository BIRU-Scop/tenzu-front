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
  resolveFileUrl = input.required<(url: string) => Promise<string>>();
  uploadFile =
    input.required<
      (
        file: File,
        blockId?: string | undefined,
      ) => Promise<string | Record<string, any>>
    >();
  data = input.required<string>();
  private root?: Root;
  private editor?: BlockNoteEditor;
  constructor() {
    effect(() => {
      const value = JSON.parse(this.data()) as Block[];
      if (!this.editor) {
        this.editor = BlockNoteEditor.create({
          codeBlock,
          initialContent: value,
          resolveFileUrl: this.resolveFileUrl(),
          uploadFile: this.uploadFile(),
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
