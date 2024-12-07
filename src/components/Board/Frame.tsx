import React, { useState, useRef } from 'react';
import { Group, Rect, Text, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';
import { Frame as FrameType, Position } from '../../types/board';

interface FrameProps extends FrameType {
  isSelected?: boolean;
  onSelect?: () => void;
  onChange?: (newAttrs: Partial<FrameType>) => void;
  onDragStart?: () => void;
  onDragEnd?: (position: Position) => void;
  stageScale: number;
}

const Frame: React.FC<FrameProps> = ({
  title,
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
  const groupRef = useRef(null);
  const trRef = useRef(null);

  const width = size?.width || 300;
  const height = size?.height || 200;

  const colorMap = {
    gray: { fill: '#F0F0F0', stroke: '#CCCCCC' },
    blue: { fill: '#E3F2FD', stroke: '#90CAF9' },
    green: { fill: '#E8F5E9', stroke: '#A5D6A7' },
    purple: { fill: '#F3E5F5', stroke: '#CE93D8' },
  };

  React.useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
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

  const handleTransform = () => {
    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale and update width/height
    node.scaleX(1);
    node.scaleY(1);
    
    const minWidth = 200;
    const minHeight = 150;
    const maxWidth = 1000;
    const maxHeight = 800;

    const newWidth = Math.max(minWidth, Math.min(maxWidth, Math.abs(node.width() * scaleX)));
    const newHeight = Math.max(minHeight, Math.min(maxHeight, Math.abs(node.height() * scaleY)));

    onChange?.({
      size: {
        width: newWidth,
        height: newHeight,
      },
    });
  };

  const handleTitleDblClick = () => {
    setIsEditing(true);
  };

  const handleTitleChange = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsEditing(false);
    onChange?.({ title: e.target.value });
  };

  return (
    <Group
      x={position.x}
      y={position.y}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => !isDragging && onSelect?.()}
      ref={groupRef}
      onTransformEnd={handleTransform}
    >
      {/* Frame background */}
      <Rect
        width={size?.width || width}
        height={size?.height || height}
        fill={colorMap[color].fill}
        stroke={isSelected ? "#0096FF" : colorMap[color].stroke}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={8}
        shadowColor="black"
        shadowBlur={isDragging ? 10 : 5}
        shadowOpacity={0.1}
        shadowOffset={{ x: 2, y: 2 }}
      />

      {/* Frame title */}
      {isEditing ? (
        <Html>
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              transform: `scale(${1 / stageScale})`,
              transformOrigin: 'top left',
            }}
          >
            <textarea
              autoFocus
              defaultValue={title}
              style={{
                width: `${(size?.width || width) - 20}px`,
                height: '30px',
                border: 'none',
                padding: '5px',
                background: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#333',
              }}
              onBlur={handleTitleChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.currentTarget.blur();
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
          x={10}
          y={10}
          text={title}
          fontSize={16}
          fontFamily="Arial"
          fill="#333"
          onDblClick={handleTitleDblClick}
        />
      )}

      {/* Transformer */}
      {isSelected && !isDragging && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            const minWidth = 200;
            const minHeight = 150;
            const maxWidth = 1000;
            const maxHeight = 800;
            
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

export default Frame;
