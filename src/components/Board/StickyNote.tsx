import React, { useState, useRef } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';
import { Position, Size } from '../../types/board';

interface StickyNoteProps extends Note {
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDragEnd: (position: Position) => void;
  onTextChange: (text: string) => void;
  onResize?: (size: Size) => void;
  isInFrame?: boolean;
  isConnecting?: boolean;
}

const StickyNote: React.FC<StickyNoteProps> = ({
  id,
  position,
  text,
  color,
  size,
  isSelected,
  onSelect,
  onDragStart,
  onDragEnd,
  onTextChange,
  onResize,
  isInFrame,
  isConnecting,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const groupRef = useRef(null);
  const trRef = useRef(null);
  const width = size?.width || 200;
  const height = size?.height || 200;

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

  return (
    <Group
      x={position.x}
      y={position.y}
      draggable
      onDragStart={(e) => {
        e.cancelBubble = true;
        setIsDragging(true);
        onDragStart();
      }}
      onDragEnd={(e) => {
        setIsDragging(false);
        onDragEnd({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onClick={(e) => {
        e.cancelBubble = true;
        if (!isDragging) {
          onSelect();
        }
      }}
      ref={groupRef}
    >
      <Rect
        width={width}
        height={height}
        fill={color}
        cornerRadius={8}
        shadowColor="black"
        shadowBlur={isDragging ? 10 : 5}
        shadowOpacity={0.1}
        shadowOffset={{ x: 2, y: 2 }}
        stroke={isSelected || isConnecting ? "#0096FF" : "transparent"}
        strokeWidth={isConnecting ? 3 : 2}
      />
      {isEditing ? (
        <Html>
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              width: `${width - 20}px`,
              height: `${height - 20}px`,
            }}
          >
            <textarea
              autoFocus
              defaultValue={text}
              style={{
                width: '100%',
                height: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: '16px',
                fontFamily: 'Arial',
                color: textColor,
                padding: '0px',
              }}
              onBlur={(e) => {
                setIsEditing(false);
                onTextChange(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  setIsEditing(false);
                  onTextChange(e.currentTarget.value);
                }
                if (e.key === 'Escape') {
                  setIsEditing(false);
                }
              }}
            />
          </div>
        </Html>
      ) : (
        <Text
          text={text}
          width={width - 20}
          height={height - 20}
          x={10}
          y={10}
          fontSize={16}
          fontFamily="Arial"
          fill={textColor}
          onDblClick={() => setIsEditing(true)}
          onClick={(e) => {
            e.cancelBubble = true;
            if (!isDragging) {
              onSelect();
            }
          }}
        />
      )}
    </Group>
  );
};

export default StickyNote;
