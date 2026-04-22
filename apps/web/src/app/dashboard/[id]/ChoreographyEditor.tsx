"use client";

import { SequenceEditor } from "../../../components/SequenceEditor";
import { useChoreographyEditor } from "../../../hooks/useChoreographyEditor";
import type { Choreography } from "../../../types/choreography";
import type { Plan } from "../../../constants/plans";

type Props = { choreography: Choreography; plan: Plan };

export function ChoreographyEditor({ choreography, plan }: Props) {
  const editor = useChoreographyEditor(choreography);

  return (
    <SequenceEditor
      choreographyId={choreography.id}
      plan={plan}
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
