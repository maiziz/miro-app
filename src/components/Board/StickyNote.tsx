import React, { useState, useRef } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';
import { Note, Position } from '../../types/board';

interface StickyNoteProps extends Note {
  isSelected?: boolean;
  onSelect?: () => void;
  onChange?: (newAttrs: Partial<Note>) => void;
  onDragStart?: () => void;
  onDragEnd?: (position: Position) => void;
  stageScale: number;
}

const StickyNote: React.FC<StickyNoteProps> = ({
  content,
  position,
  color,
  size,
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

  const width = 150;
  const height = 150;

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
      e.preventDefault();
      e.currentTarget.blur();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleTextareaBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsEditing(false);
    onChange?.({ content: e.target.value });
  };

  const handleTransform = () => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();

    // Reset scale and update width/height
    node.scaleX(1);
    node.scaleY(1);
    
    const minWidth = 100;
    const minHeight = 100;
    const maxWidth = 500;
    const maxHeight = 500;

    const newWidth = Math.max(minWidth, Math.min(maxWidth, Math.abs(node.width() * scaleX)));
    const newHeight = Math.max(minHeight, Math.min(maxHeight, Math.abs(node.height() * scaleY)));

    onChange?.({
      size: {
        width: newWidth,
        height: newHeight,
      },
    });
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
      onTransformEnd={handleTransform}
    >
      <Rect
        width={size?.width || width}
        height={size?.height || height}
        fill={colorMap[color]}
        shadowColor="black"
        shadowBlur={isDragging ? 10 : 5}
        shadowOpacity={0.2}
        shadowOffset={{ x: 2, y: 2 }}
        cornerRadius={5}
        stroke={isSelected ? "#0096FF" : undefined}
        strokeWidth={isSelected ? 2 : 0}
      />

      {/* Top bar indicator for when note is in a frame */}
      <Rect
        width={size?.width || width}
        height={3}
        fill={colorMap[color]}
        opacity={0.6}
      />

      {isEditing ? (
        <Html>
          <div
            style={{
              position: 'absolute',
              top: '0px',
              left: '0px',
              width: `${size?.width || width}px`,
              height: `${size?.height || height}px`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                width: `${(size?.width || width) - 20}px`,
                height: `${(size?.height || height) - 20}px`,
                transform: `scale(${1 / stageScale})`,
                transformOrigin: 'top left',
              }}
            >
              <textarea
                autoFocus
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
          </div>
        </Html>
      ) : (
        <Text
          text={content}
          width={(size?.width || width) - 20}
          height={(size?.height || height) - 20}
          x={10}
          y={10}
          fontSize={16}
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
            const maxWidth = 500;
            const maxHeight = 500;
            
            const isWidthValid = newBox.width >= minWidth && newBox.width <= maxWidth;
            const isHeightValid = newBox.height >= minHeight && newBox.height <= maxHeight;
            
            return {
              ...newBox,
              width: isWidthValid ? newBox.width : oldBox.width,
              height: isHeightValid ? newBox.height : oldBox.height,
            };
          }}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          rotateEnabled={false}
          flipEnabled={true}
          borderStroke="#0096FF"
          borderStrokeWidth={2}
          anchorFill="#0096FF"
          anchorStroke="#fff"
          anchorSize={8}
          anchorCornerRadius={2}
        />
      )}
    </Group>
  );
};

export default StickyNote;
