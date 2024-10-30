/*
 * Copyright (C) 2024 BIRU
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

import { ChangeDetectionStrategy, Component, ElementRef, inject, input, OnInit, viewChild } from "@angular/core";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import CodeTool from "@editorjs/code";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import Delimiter from "@editorjs/delimiter";
import Warning from "@editorjs/warning";
import InlineCode from "@editorjs/inline-code";
import Checklist from "@editorjs/checklist";
import { toObservable } from "@angular/core/rxjs-interop";
import { TranslocoService } from "@jsverse/transloco";

@Component({
  selector: "app-editor",
  standalone: true,
  imports: [],
  template: `<div #editorContainer></div>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent implements OnInit {
  translocoService = inject(TranslocoService);
  data = input({} as OutputData, {
    transform: (value: OutputData | string | undefined) => {
      return typeof value === "string" ? JSON.parse(value) : value;
    },
  });
  data$ = toObservable(this.data);
  editor: EditorJS | undefined;
  container = viewChild.required<ElementRef>("editorContainer");

  ngOnInit(): void {
    this.editor = new EditorJS({
      holder: this.container()?.nativeElement,
      minHeight: 0,
      placeholder: this.translocoService.translateObject("workflow.detail_story.empty_description"),
      tools: {
        header: Header,
        code: CodeTool,
        list: List,
        quote: Quote,
        delimiter: Delimiter,
        warning: Warning,
        inlineCode: {
          class: InlineCode,
          shortcut: "CMD+SHIFT+M",
        },
        checklist: {
          class: Checklist,
          inlineToolbar: true,
        },
      },
    });
    this.editor.isReady.then(() => {
      this.data$.subscribe((value) => {
        if (value) {
          this.editor?.render(value);
        }
      });
    });
  }
  async save() {
    return this.editor?.save();
  }
  async cancel() {
    return this.editor?.render(this.data());
  }
}
