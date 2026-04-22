"use client";

import { SequenceEditor } from "../../../components/SequenceEditor";
import { useChoreographyEditor } from "../../../hooks/useChoreographyEditor";
import type { Choreography } from "../../../types/choreography";

export function ChoreographyEditor({ choreography }: { choreography: Choreography }) {
  const editor = useChoreographyEditor(choreography);

  return (
    <SequenceEditor
      name={editor.name}
      onNameChange={editor.setName}
      description={editor.description}
      onDescriptionChange={editor.setDescription}
      moves={editor.moves}
      onUpdateMove={editor.updateMove}
      onMoveUp={editor.moveUp}
      onMoveDown={editor.moveDown}
      onDeleteMove={editor.deleteMove}
      onAddMove={editor.addMove}
      music={editor.music}
      onUpdateMusic={editor.updateMusic}
      onClearMusic={editor.clearMusic}
      status={editor.status}
      onSave={editor.save}
    />
  );
}
