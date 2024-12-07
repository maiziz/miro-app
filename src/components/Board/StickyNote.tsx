import React, { useState, useRef } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';
import { Position, Size } from '../../types/board';

interface StickyNoteProps {
  id: string;
  position: Position;
  text: string;
  isSelected?: boolean;
  onSelect?: () => void;
  onDragStart?: () => void;
  onDragEnd?: (position: Position) => void;
  onTextChange?: (text: string) => void;
  size?: Size;
  onResize?: (size: Size) => void;
  color: string;
  isInFrame?: boolean;
}

const StickyNote: React.FC<StickyNoteProps> = ({
  id,
  position,
  text,
  isSelected = false,
  onSelect,
  onDragStart,
  onDragEnd,
  onTextChange,
  size,
  onResize,
  color = '#FFD700',
  isInFrame = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const shapeRef = useRef(null);
  const trRef = useRef(null);

  const width = 150;
  const height = 150;

  // Function to determine text color based on background color
  const getContrastTextColor = (bgColor: string) => {
    // Remove the # if present
    const hex = bgColor.replace('#', '');
    
    // Convert hex to RGB
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light backgrounds, white for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  const textColor = getContrastTextColor(color);

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

  const handleTextareaBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value.trim();
    if (newText !== text) {
      onTextChange?.(newText);
    }
    setIsEditing(false);
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const newText = target.value.trim();
      if (newText !== text) {
        onTextChange?.(newText);
      }
      setIsEditing(false);
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
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

    onResize?.({
      width: newWidth,
      height: newHeight,
    });
  };

  return (
    <Group
      x={position.x}
      y={position.y}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        e.cancelBubble = true;
        if (!isDragging && !isEditing) {
          onSelect?.();
        }
      }}
      onDblClick={() => {
        if (!isEditing) {
          setIsEditing(true);
        }
      }}
      ref={shapeRef}
      onTransformEnd={handleTransform}
    >
      <Rect
        width={size?.width || width}
        height={size?.height || height}
        fill={color}
        shadowColor="black"
        shadowBlur={isDragging ? 10 : 5}
        shadowOpacity={0.2}
        shadowOffset={{ x: 2, y: 2 }}
        cornerRadius={5}
        stroke={isSelected ? "#0096FF" : undefined}
        strokeWidth={isSelected ? 2 : 0}
        onClick={(e) => {
          e.cancelBubble = true;
          if (!isDragging && !isEditing) {
            onSelect?.();
          }
        }}
      />

      {/* Top bar indicator for when note is in a frame */}
      {isInFrame && (
        <Rect
          width={size?.width || width}
          height={4}
          fill={color}
          opacity={0.8}
          y={0}
        />
      )}
      {isEditing ? (
        <Html>
          <div
            style={{
              position: 'absolute',
              top: '0px',
              left: '0px',
              width: '100%',
              height: '100%',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                width: `${(size?.width || width) - 20}px`,
                height: `${(size?.height || height) - 20}px`,
                transform: `scale(${1 / 1})`,
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
                  background: color,
                  color: textColor,
                  outline: 'none',
                  resize: 'none',
                  fontSize: '16px',
                  fontFamily: 'Arial',
                  lineHeight: '1.4',
                  overflow: 'hidden',
                }}
                defaultValue={text}
                onKeyDown={handleTextareaKeyDown}
                onBlur={handleTextareaBlur}
              />
            </div>
          </div>
        </Html>
      ) : (
        <Text
          text={text}
          width={(size?.width || width) - 20}
          height={(size?.height || height) - 20}
          x={10}
          y={10}
          fontSize={16}
          fontFamily="Arial"
          fill={textColor}
          wrap="word"
          align="left"
          onDblClick={() => {
            if (!isEditing) {
              setIsEditing(true);
            }
          }}
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
