import React from 'react';
import { Note } from '../../types/board';
import { Position } from '../../types/board';
import { Draggable } from '../Common/Draggable';

interface StickyNoteProps {
  note: Note;
  onDragEnd: (position: Position) => void;
}

const colorClasses = {
  yellow: 'bg-yellow-100 hover:bg-yellow-200',
  blue: 'bg-blue-100 hover:bg-blue-200',
  green: 'bg-green-100 hover:bg-green-200',
  pink: 'bg-pink-100 hover:bg-pink-200'
};

export const StickyNote: React.FC<StickyNoteProps> = ({ note, onDragEnd }) => {
  return (
    <Draggable
      initialPosition={note.position}
      onDragEnd={onDragEnd}
    >
      <div
        className={`
          w-[200px] p-4 rounded-lg shadow-md
          transform rotate-[-1deg]
          transition-transform hover:scale-105
          ${colorClasses[note.color]}
        `}
      >
        <p className="font-medium text-gray-800 whitespace-pre-wrap">
          {note.content}
        </p>
      </div>
    </Draggable>
  );
};