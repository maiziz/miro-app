import React from 'react';
import { TextBox as TextBoxType, Position } from '../../types/board';
import { Draggable } from './Draggable';

interface TextBoxProps {
  text: TextBoxType;
  onDragEnd: (position: Position) => void;
}

export const TextBox: React.FC<TextBoxProps> = ({ text, onDragEnd }) => {
  return (
    <Draggable
      initialPosition={text.position}
      onDragEnd={onDragEnd}
    >
      <div className="w-[300px] p-4 bg-white rounded-lg shadow-sm">
        <p className="text-gray-700 whitespace-pre-wrap">
          {text.content}
        </p>
      </div>
    </Draggable>
  );
};