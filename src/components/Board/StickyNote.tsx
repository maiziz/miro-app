import React, { useState, useRef } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';
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
  id,
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
  const [isEditing, setIsEditing] = useState(false);
  const shapeRef = useRef(null);
  const trRef = useRef(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

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

  const handleTextDblClick = () => {
    setIsEditing(true);
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      setIsEditing(false);
      onChange?.({ content: e.currentTarget.value });
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleTextareaBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsEditing(false);
    onChange?.({ content: e.target.value });
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
      {isEditing ? (
        <Html
          divProps={{
            style: {
              position: 'absolute',
              top: '0px',
              left: '0px',
              width: `${width}px`,
              height: `${height}px`,
            },
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              width: `${width - 20}px`,
              height: `${height - 20}px`,
              transform: `scale(${1 / stageScale})`,
              transformOrigin: 'top left',
            }}
          >
            <textarea
              ref={textareaRef}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                padding: '0px',
                margin: '0px',
                background: colorMap[color],
                outline: 'none',
                resize: 'none',
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#333',
                lineHeight: '1.4',
                overflow: 'hidden',
              }}
              defaultValue={content}
              onKeyDown={handleTextareaKeyDown}
              onBlur={handleTextareaBlur}
            />
          </div>
        </Html>
      ) : (
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
          onDblClick={handleTextDblClick}
        />
      )}
      {isSelected && !isEditing && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
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
