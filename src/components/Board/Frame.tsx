import React, { useState, useRef } from 'react';
import { Group, Rect, Text, Transformer, Line } from 'react-konva';
import { Html } from 'react-konva-utils';
import { Frame as FrameType, Position, Note } from '../../types/board';

interface FrameProps extends FrameType {
  isSelected?: boolean;
  onSelect?: () => void;
  onChange?: (newAttrs: Partial<FrameType>) => void;
  onDragStart?: () => void;
  onDragEnd?: (position: Position) => void;
  stageScale: number;
  notes?: Note[];
  onNotesMove?: (noteIds: string[], offset: Position) => void;
}

const Frame: React.FC<FrameProps> = ({
  title,
  position,
  size,
  color,
  isSelected = false,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
  stageScale,
  notes = [],
  onNotesMove,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDimensions, setShowDimensions] = useState(false);
  const [startPos, setStartPos] = useState<Position | null>(null);
  const [isEditingWidth, setIsEditingWidth] = useState(false);
  const [isEditingHeight, setIsEditingHeight] = useState(false);
  const [tempWidth, setTempWidth] = useState(size?.width?.toString() || '300');
  const [tempHeight, setTempHeight] = useState(size?.height?.toString() || '200');
  const [draggedNotes, setDraggedNotes] = useState<string[]>([]);
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

  const handleDragStart = (e: any) => {
    setIsDragging(true);
    const newPosition = {
      x: e.target.x(),
      y: e.target.y(),
    };
    setStartPos(newPosition);
    onDragStart?.();

    const overlappingNotes = notes?.filter(note => isNoteInFrame(note, newPosition)) || [];
    setDraggedNotes(overlappingNotes.map(note => note.id));
  };

  const handleDragMove = (e: any) => {
    if (!startPos || !draggedNotes.length) return;

    const newPosition = {
      x: e.target.x(),
      y: e.target.y(),
    };

    const offset = {
      x: newPosition.x - startPos.x,
      y: newPosition.y - startPos.y,
    };

    onNotesMove?.(draggedNotes, offset);
    setStartPos(newPosition);
  };

  const handleDragEnd = (e: any) => {
    setIsDragging(false);
    const newPosition = {
      x: e.target.x(),
      y: e.target.y(),
    };

    if (startPos) {
      const offset = {
        x: newPosition.x - startPos.x,
        y: newPosition.y - startPos.y,
      };

      const containedNotes = notes.filter(note => isNoteInFrame(note, startPos));
      if (containedNotes.length > 0) {
        onNotesMove?.(containedNotes.map(note => note.id), offset);
      }
    }

    onDragEnd?.(newPosition);
    setStartPos(null);
    setDraggedNotes([]);
  };

  const handleTransform = () => {
    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

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

  const isNoteInFrame = (note: Note, framePos: Position) => {
    const frameRight = framePos.x + width;
    const frameBottom = framePos.y + height;
    const noteRight = note.position.x + (note.size?.width || 150);
    const noteBottom = note.position.y + (note.size?.height || 150);

    const hasOverlap = !(
      note.position.x > frameRight ||
      noteRight < framePos.x ||
      note.position.y > frameBottom ||
      noteBottom < framePos.y
    );

    if (hasOverlap) {
      const overlapWidth = Math.min(noteRight, frameRight) - Math.max(note.position.x, framePos.x);
      const overlapHeight = Math.min(noteBottom, frameBottom) - Math.max(note.position.y, framePos.y);
      const noteArea = (note.size?.width || 150) * (note.size?.height || 150);
      const overlapArea = overlapWidth * overlapHeight;
      
      return (overlapArea / noteArea) >= 0.3;
    }

    return false;
  };

  const handleTitleDblClick = () => {
    setIsEditing(true);
  };

  const handleTitleChange = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsEditing(false);
    onChange?.({ title: e.target.value });
  };

  const handleDimensionChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = parseInt(value, 10);
    const minSize = dimension === 'width' ? 200 : 150;
    const maxSize = dimension === 'width' ? 1000 : 800;

    if (!isNaN(numValue) && numValue >= minSize && numValue <= maxSize) {
      onChange?.({
        size: {
          width: dimension === 'width' ? numValue : width,
          height: dimension === 'height' ? numValue : height,
        },
      });
    }
  };

  return (
    <Group
      x={position.x}
      y={position.y}
      draggable
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        // Stop event propagation
        e.cancelBubble = true;
        
        // Only trigger selection if not dragging and not editing dimensions
        if (!isDragging && !isEditingWidth && !isEditingHeight) {
          onSelect?.();
        }
      }}
      onTap={(e) => {
        // Handle touch events similarly
        e.cancelBubble = true;
        if (!isDragging && !isEditingWidth && !isEditingHeight) {
          onSelect?.();
        }
      }}
      ref={groupRef}
      onTransformEnd={handleTransform}
    >
      {/* Frame background */}
      <Rect
        width={width}
        height={height}
        fill={colorMap[color].fill}
        stroke={isSelected ? "#0096FF" : colorMap[color].stroke}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={8}
        shadowColor="black"
        shadowBlur={isDragging ? 10 : 5}
        shadowOpacity={0.1}
        shadowOffset={{ x: 2, y: 2 }}
        onClick={(e) => {
          // Prevent click from reaching group
          e.cancelBubble = true;
          if (!isDragging && !isEditingWidth && !isEditingHeight) {
            onSelect?.();
          }
        }}
      />

      {/* Size dimensions */}
      {isSelected && (
        <>
          {/* Width dimension */}
          <Group y={height + 10}>
            <Line
              points={[0, 0, width, 0]}
              stroke="#666"
              strokeWidth={1}
              dash={[4, 4]}
            />
            <Line
              points={[0, -5, 0, 5]}
              stroke="#666"
              strokeWidth={1}
            />
            <Line
              points={[width, -5, width, 5]}
              stroke="#666"
              strokeWidth={1}
            />
            {isEditingWidth ? (
              <Html>
                <input
                  type="text"
                  value={tempWidth}
                  onChange={(e) => setTempWidth(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleDimensionChange('width', tempWidth);
                      setIsEditingWidth(false);
                    }
                    if (e.key === 'Escape') {
                      setTempWidth(width.toString());
                      setIsEditingWidth(false);
                    }
                  }}
                  onBlur={() => {
                    handleDimensionChange('width', tempWidth);
                    setIsEditingWidth(false);
                  }}
                  autoFocus
                  style={{
                    position: 'absolute',
                    left: `${width / 2 - 25}px`,
                    top: '0px',
                    width: '50px',
                    height: '20px',
                    fontSize: '12px',
                    padding: '2px 4px',
                    border: '1px solid #666',
                    borderRadius: '3px',
                    background: 'white',
                    transform: `scale(${1 / stageScale})`,
                    transformOrigin: 'top left',
                  }}
                />
              </Html>
            ) : (
              <Text
                x={width / 2}
                y={5}
                text={`${Math.round(width)}px`}
                fontSize={12}
                fill="#666"
                align="center"
                offsetX={20}
                onClick={() => {
                  setIsEditingWidth(true);
                  setTempWidth(width.toString());
                }}
              />
            )}
          </Group>

          {/* Height dimension */}
          <Group x={width + 10}>
            <Line
              points={[0, 0, 0, height]}
              stroke="#666"
              strokeWidth={1}
              dash={[4, 4]}
            />
            <Line
              points={[-5, 0, 5, 0]}
              stroke="#666"
              strokeWidth={1}
            />
            <Line
              points={[-5, height, 5, height]}
              stroke="#666"
              strokeWidth={1}
            />
            {isEditingHeight ? (
              <Html>
                <input
                  type="text"
                  value={tempHeight}
                  onChange={(e) => setTempHeight(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleDimensionChange('height', tempHeight);
                      setIsEditingHeight(false);
                    }
                    if (e.key === 'Escape') {
                      setTempHeight(height.toString());
                      setIsEditingHeight(false);
                    }
                  }}
                  onBlur={() => {
                    handleDimensionChange('height', tempHeight);
                    setIsEditingHeight(false);
                  }}
                  autoFocus
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: `${height / 2 - 10}px`,
                    width: '50px',
                    height: '20px',
                    fontSize: '12px',
                    padding: '2px 4px',
                    border: '1px solid #666',
                    borderRadius: '3px',
                    background: 'white',
                    transform: `scale(${1 / stageScale})`,
                    transformOrigin: 'top left',
                  }}
                />
              </Html>
            ) : (
              <Text
                x={5}
                y={height / 2}
                text={`${Math.round(height)}px`}
                fontSize={12}
                fill="#666"
                align="left"
                offsetY={-6}
                onClick={() => {
                  setIsEditingHeight(true);
                  setTempHeight(height.toString());
                }}
              />
            )}
          </Group>
        </>
      )}

      {/* Visual indicator for contained notes */}
      {notes.filter(note => isNoteInFrame(note, position)).length > 0 && (
        <Rect
          width={width}
          height={4}
          fill={colorMap[color].stroke}
          opacity={0.8}
          y={0}
        />
      )}

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
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <textarea
              autoFocus
              defaultValue={title}
              style={{
                width: `${width - 20}px`,
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
            {notes.filter(note => isNoteInFrame(note, position)).length > 0 && (
              <span style={{ 
                fontSize: '12px', 
                color: '#666',
                background: colorMap[color].stroke,
                padding: '2px 6px',
                borderRadius: '10px',
                color: '#fff'
              }}>
                {notes.filter(note => isNoteInFrame(note, position)).length}
              </span>
            )}
          </div>
        </Html>
      ) : (
        <Group>
          <Text
            x={10}
            y={10}
            text={title}
            fontSize={16}
            fontFamily="Arial"
            fill="#333"
            onDblClick={handleTitleDblClick}
          />
          {notes.filter(note => isNoteInFrame(note, position)).length > 0 && (
            <Rect
              x={width - 30}
              y={10}
              width={20}
              height={20}
              cornerRadius={10}
              fill={colorMap[color].stroke}
            />
          )}
          {notes.filter(note => isNoteInFrame(note, position)).length > 0 && (
            <Text
              x={width - 30}
              y={10}
              width={20}
              height={20}
              text={notes.filter(note => isNoteInFrame(note, position)).length.toString()}
              fontSize={12}
              fontFamily="Arial"
              fill="#fff"
              align="center"
              verticalAlign="middle"
            />
          )}
        </Group>
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
