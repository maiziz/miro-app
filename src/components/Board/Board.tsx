import React, { useState, useRef } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { v4 as uuidv4 } from 'uuid';
import Toolbar from './Toolbar';
import StickyNote from './StickyNote';
import { Note, Position, NoteColor } from '../../types/board';

interface BoardState {
  notes: Note[];
  selectedId: string | null;
}

const Board: React.FC = () => {
  const [stageSize, setStageSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [boardState, setBoardState] = useState<BoardState>({
    notes: [],
    selectedId: null,
  });
  const stageRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle window resize
  React.useEffect(() => {
    const checkSize = () => {
      setStageSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Handle zoom
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = scale;

    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    setScale(newScale);
    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  // Handle stage drag
  const handleStageDragStart = () => {
    setIsDragging(true);
  };

  const handleStageDragEnd = (e: KonvaEventObject<DragEvent>) => {
    setIsDragging(false);
    const stage = e.target.getStage();
    setPosition({
      x: stage.x(),
      y: stage.y(),
    });
  };

  // Add sticky note
  const addNote = (color: NoteColor = 'yellow') => {
    const stage = stageRef.current;
    const position = stage.getPointerPosition();
    const newNote: Note = {
      id: uuidv4(),
      type: 'note',
      position: {
        x: (position.x - stage.x()) / scale,
        y: (position.y - stage.y()) / scale,
      },
      content: 'Double click to edit',
      color,
    };

    setBoardState(prev => ({
      ...prev,
      notes: [...prev.notes, newNote],
      selectedId: newNote.id,
    }));
  };

  // Update note position
  const handleNoteChange = (id: string, newAttrs: Partial<Note>) => {
    setBoardState(prev => ({
      ...prev,
      notes: prev.notes.map(note =>
        note.id === id ? { ...note, ...newAttrs } : note
      ),
    }));
  };

  // Handle note drag
  const handleNoteDragStart = (id: string) => {
    setIsDragging(true);
    handleNoteSelect(id);
  };

  const handleNoteDragEnd = (id: string, newPosition: Position) => {
    setIsDragging(false);
    handleNoteChange(id, { position: newPosition });
  };

  // Select note
  const handleNoteSelect = (id: string) => {
    if (!isDragging) {
      setBoardState(prev => ({
        ...prev,
        selectedId: id,
      }));
    }
  };

  // Grid properties
  const gridSize = 20;
  const gridColor = '#CCCCCC';
  const gridOpacity = 0.2;

  // Calculate number of grid lines needed
  const numHorizontalLines = Math.ceil(stageSize.height / gridSize);
  const numVerticalLines = Math.ceil(stageSize.width / gridSize);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#F5F5F5' }}>
      <Toolbar onAddNote={addNote} />
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        ref={stageRef}
        onWheel={handleWheel}
        draggable
        onDragStart={handleStageDragStart}
        onDragEnd={handleStageDragEnd}
        scale={{ x: scale, y: scale }}
        x={position.x}
        y={position.y}
        onClick={(e) => {
          // Deselect when clicking on empty area
          const clickedOnEmpty = e.target === e.target.getStage();
          if (clickedOnEmpty && !isDragging) {
            setBoardState(prev => ({ ...prev, selectedId: null }));
          }
        }}
      >
        <Layer>
          {/* Background */}
          <Rect
            width={stageSize.width}
            height={stageSize.height}
            fill="#ffffff"
          />
          
          {/* Grid - Vertical lines */}
          {Array.from({ length: numVerticalLines }).map((_, i) => (
            <Rect
              key={`v-${i}`}
              x={i * gridSize}
              y={0}
              width={1}
              height={stageSize.height}
              fill={gridColor}
              opacity={gridOpacity}
            />
          ))}
          
          {/* Grid - Horizontal lines */}
          {Array.from({ length: numHorizontalLines }).map((_, i) => (
            <Rect
              key={`h-${i}`}
              x={0}
              y={i * gridSize}
              width={stageSize.width}
              height={1}
              fill={gridColor}
              opacity={gridOpacity}
            />
          ))}

          {/* Sticky Notes */}
          {boardState.notes.map((note) => (
            <StickyNote
              key={note.id}
              {...note}
              isSelected={note.id === boardState.selectedId}
              onSelect={() => handleNoteSelect(note.id)}
              onDragStart={() => handleNoteDragStart(note.id)}
              onDragEnd={(newPosition) => handleNoteDragEnd(note.id, newPosition)}
              onChange={(newAttrs) => handleNoteChange(note.id, newAttrs)}
              stageScale={scale}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Board;
