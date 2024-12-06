import React, { useState, useCallback, useRef } from 'react';
import { Position } from '../../types/board';

interface DraggableProps {
  children: React.ReactNode;
  initialPosition: Position;
  onDragEnd: (position: Position) => void;
}

export const Draggable: React.FC<DraggableProps> = ({
  children,
  initialPosition,
  onDragEnd
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const dragStartRef = useRef<{ x: number; y: number; pos: Position } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      pos: { ...position }
    };
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && dragStartRef.current) {
      e.stopPropagation();
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      
      const newPosition = {
        x: dragStartRef.current.pos.x + dx,
        y: dragStartRef.current.pos.y + dy
      };
      
      setPosition(newPosition);
    }
  }, [isDragging]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
      onDragEnd(position);
    }
  }, [isDragging, position, onDragEnd]);

  return (
    <div
      className={`absolute cursor-move ${isDragging ? 'z-50' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        userSelect: 'none',
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {children}
    </div>
  );
};