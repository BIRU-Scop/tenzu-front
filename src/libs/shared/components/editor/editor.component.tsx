import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
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
import { Block, BlockNoteEditor } from "@blocknote/core";
import { createCodeBlockSpec } from "@blocknote/core";
import { codeBlockOptions } from "@blocknote/code-block";
import { BlockNoteView } from "@blocknote/mantine";
import { FormValueControl } from "@angular/forms/signals";
import { resolveFileUrl } from "./utils";

@Component({
  selector: "app-editor-block",
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
export class EditorComponent
  implements
    OnChanges,
    OnDestroy,
    AfterViewInit,
    FormValueControl<string | null>
{
  value = model<string | null>(null);
  touched = model(false);
  elm = viewChild<ElementRef>("editor");
  disabled = input(false);
  readonly = input(false);
  resolveFileUrl = resolveFileUrl();

  uploadFile = input.required<
    | undefined
    | ((
        file: File,
        blockId?: string | undefined,
      ) => Promise<string | Record<string, any>>)
  >();
  focus = input(false);
  validate = output();
  private root?: Root;
  private editor?: BlockNoteEditor;
  constructor() {
    const codeBlock = createCodeBlockSpec(codeBlockOptions);

    effect(() => {
      const data = this.value();
      const initialContent = data
        ? { initialContent: JSON.parse(data) as Block[] }
        : {};
      if (!this.editor) {
        this.editor = BlockNoteEditor.create({
          codeBlock,
          resolveFileUrl: this.resolveFileUrl,
          uploadFile: this.uploadFile(),
          autofocus: this.focus(),
          ...initialContent,
        });

        this.editor.onChange((data) => {
          this.value.set(JSON.stringify(data?.document));
          if (!this.touched()) {
            this.touched.set(true);
          }
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
        <BlockNoteView editor={this.editor} editable={!this.readonly()} />,
      );
    }
  }
}
