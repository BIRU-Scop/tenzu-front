import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  input,
  OnChanges,
  OnDestroy,
  output,
  SimpleChanges,
  viewChild,
} from "@angular/core";
import * as React from "react";

import { createRoot, Root } from "react-dom/client";
import { Block, BlockNoteEditor } from "@blocknote/core";
import { createCodeBlockSpec } from "@blocknote/core";
import { codeBlockOptions } from "@blocknote/code-block";

import { BlockNoteView } from "@blocknote/mantine";

@Component({
  selector: "app-editor-block",
  template: ` <div
    (keydown.control.enter)="validate.emit()"
    (keydown.meta.enter)="validate.emit()"
    [class.disabled-editor]="disabled()"
    #editor
  ></div>`,
  styles: `
    :host {
      box-sizing: border-box;
      padding: 1em;
      border-style: solid;
      border-radius: 0.25rem;
      border-color: var(--mat-sys-outline);
      border-width: 1px;
      &:hover:has(> :not(.disabled-editor)) {
        border-color: var(--mat-sys-on-primary);
      }
      &:has(.ProseMirror-focused):has(> :not(.disabled-editor)) {
        border-color: var(--mat-sys-primary);
        border-width: 2px;
        padding: calc(1em - 1px);
      }
    }
  `,
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
  data = input<string | null>();
  focus = input(false);
  validate = output();
  private root?: Root;
  private editor?: BlockNoteEditor;
  constructor() {
    const codeBlock = createCodeBlockSpec(codeBlockOptions);
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
          autofocus: this.focus(),
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

  public get jsonContent() {
    return JSON.stringify(this.editor?.document);
  }
  public set jsonContent(content: string) {
    const data = JSON.parse(content) as Block[];
    this.editor?.replaceBlocks(this.editor?.document, data);
  }

  public undo() {
    this.editor?.undo();
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
    if (this.root && this.editor) {
      this.root.render(
        <React.StrictMode>
          <BlockNoteView editor={this.editor} editable={!this.disabled()} />
        </React.StrictMode>,
      );
    }
  }
}
