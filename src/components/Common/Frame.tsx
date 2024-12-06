import React from 'react';
import { Position } from '../../types/board';
import { Draggable } from './Draggable';

interface FrameProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onDragEnd?: (position: Position) => void;
}

export const Frame: React.FC<FrameProps> = ({
  children,
  className = '',
  style = {},
  onDragEnd
}) => {
  const content = (
    <div
      className={`border border-gray-200 rounded-xl ${className}`}
      style={style}
    >
      {children}
    </div>
  );

  if (onDragEnd) {
    return (
      <Draggable
        initialPosition={{ x: style.left as number, y: style.top as number }}
        onDragEnd={onDragEnd}
      >
        {content}
      </Draggable>
    );
  }

  return content;
};