import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import React from "react";
import { FunctionComponent } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

export interface EditorProps {
  editor: BlockNoteEditor;
  editable: boolean;
}

export const Editor: FunctionComponent<EditorProps> = (props: EditorProps) => {
  const { editor, editable } = props;

  return <BlockNoteView editor={editor} editable={editable} />;
};
