import React, { useState } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import { Note, Position } from '../../types/board';

interface StickyNoteProps extends Note {
  isSelected?: boolean;
  onSelect?: () => void;
  onChange?: (newAttrs: any) => void;
  onDragStart?: () => void;
  onDragEnd?: (position: Position) => void;
  stageScale: number;
}

const StickyNote: React.FC<StickyNoteProps> = ({
  content,
  position,
  color,
  isSelected = false,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  stageScale,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const shapeRef = React.useRef(null);
  const trRef = React.useRef(null);

  const colorMap = {
    yellow: '#fff9c4',
    blue: '#bbdefb',
    green: '#c8e6c9',
    pink: '#f8bbd0',
  };

  React.useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const width = 150;
  const height = 150;

  const handleDragStart = () => {
    setIsDragging(true);
    onDragStart?.();
  };

  const handleDragEnd = (e: any) => {
    setIsDragging(false);
    const newPosition = {
      x: e.target.x(),
      y: e.target.y(),
    };
    onDragEnd?.(newPosition);
  };

  return (
    <Group
      x={position.x}
      y={position.y}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => !isDragging && onSelect?.()}
      onTap={onSelect}
      ref={shapeRef}
    >
      <Rect
        width={width}
        height={height}
        fill={colorMap[color]}
        shadowColor="black"
        shadowBlur={isDragging ? 10 : 5}
        shadowOpacity={0.2}
        shadowOffset={{ x: 2, y: 2 }}
        cornerRadius={5}
      />
      <Text
        text={content}
        width={width - 20}
        height={height - 20}
        x={10}
        y={10}
        fontSize={16 / stageScale}
        fontFamily="Arial"
        fill="#333"
        wrap="word"
        align="left"
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            const minWidth = 100;
            const minHeight = 100;
            const maxWidth = 400;
            const maxHeight = 400;
            
            if (
              newBox.width < minWidth ||
              newBox.height < minHeight ||
              newBox.width > maxWidth ||
              newBox.height > maxHeight
            ) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </Group>
  );
};

export default StickyNote;
