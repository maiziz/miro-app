import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Group, Line } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { v4 as uuidv4 } from 'uuid';
import Toolbar from './Toolbar';
import StickyNote from './StickyNote';
import Frame from './Frame';
import { Note, Position, NoteColor, Frame as FrameType, FrameColor } from '../../types/board';

interface BoardState {
  notes: Note[];
  frames: FrameType[];
  selectedId: string | null;
}

const STORAGE_KEY = 'miroboard_state';

const Board: React.FC = () => {
  const [stageSize, setStageSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [boardState, setBoardState] = useState<BoardState>(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : {
      notes: [],
      frames: [],
      selectedId: null,
    };
  });
  const stageRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boardState));
  }, [boardState]);

  // Handle window resize
  useEffect(() => {
    const checkSize = () => {
      setStageSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) {
        return; // Don't handle shortcuts while editing text
      }

      // Delete selected note
      if ((e.key === 'Delete' || e.key === 'Backspace') && boardState.selectedId) {
        e.preventDefault();
        setBoardState(prev => ({
          ...prev,
          notes: prev.notes.filter(note => note.id !== prev.selectedId),
          frames: prev.frames.filter(frame => frame.id !== prev.selectedId),
          selectedId: null,
        }));
      }

      // Copy selected note
      if (e.key === 'c' && (e.ctrlKey || e.metaKey) && boardState.selectedId) {
        e.preventDefault();
        const selectedNote = boardState.notes.find(note => note.id === boardState.selectedId);
        const selectedFrame = boardState.frames.find(frame => frame.id === boardState.selectedId);
        if (selectedNote) {
          localStorage.setItem('clipboard_note', JSON.stringify(selectedNote));
        } else if (selectedFrame) {
          localStorage.setItem('clipboard_frame', JSON.stringify(selectedFrame));
        }
      }

      // Paste note
      if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const clipboardNote = localStorage.getItem('clipboard_note');
        const clipboardFrame = localStorage.getItem('clipboard_frame');
        if (clipboardNote) {
          const note: Note = JSON.parse(clipboardNote);
          const stage = stageRef.current;
          const pointerPosition = stage.getPointerPosition();
          const newNote: Note = {
            ...note,
            id: uuidv4(),
            position: {
              x: (pointerPosition.x - stage.x()) / scale,
              y: (pointerPosition.y - stage.y()) / scale,
            },
          };
          setBoardState(prev => ({
            ...prev,
            notes: [...prev.notes, newNote],
            selectedId: newNote.id,
          }));
        } else if (clipboardFrame) {
          const frame: FrameType = JSON.parse(clipboardFrame);
          const stage = stageRef.current;
          const pointerPosition = stage.getPointerPosition();
          const newFrame: FrameType = {
            ...frame,
            id: uuidv4(),
            position: {
              x: (pointerPosition.x - stage.x()) / scale,
              y: (pointerPosition.y - stage.y()) / scale,
            },
          };
          setBoardState(prev => ({
            ...prev,
            frames: [...prev.frames, newFrame],
            selectedId: newFrame.id,
          }));
        }
      }

      // Deselect with Escape
      if (e.key === 'Escape') {
        setBoardState(prev => ({ ...prev, selectedId: null }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [boardState.selectedId, scale]);

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

  // Add frame
  const addFrame = (color: FrameColor = 'gray') => {
    const stage = stageRef.current;
    const position = stage.getPointerPosition();
    const newFrame: FrameType = {
      id: uuidv4(),
      type: 'frame',
      position: {
        x: (position.x - stage.x()) / scale,
        y: (position.y - stage.y()) / scale,
      },
      title: 'New Frame',
      color,
      size: {
        width: 300,
        height: 200,
      },
    };

    setBoardState(prev => ({
      ...prev,
      frames: [...(prev.frames || []), newFrame],
      selectedId: newFrame.id,
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

  // Update note
  const handleNoteChange = (id: string, newAttrs: Partial<Note>) => {
    setBoardState(prev => ({
      ...prev,
      notes: prev.notes.map(note =>
        note.id === id ? { ...note, ...newAttrs } : note
      ),
    }));
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

  // Handle frame drag
  const handleFrameDragStart = (id: string) => {
    setIsDragging(true);
    handleFrameSelect(id);
  };

  const handleFrameDragEnd = (id: string, newPosition: Position) => {
    setIsDragging(false);
    handleFrameChange(id, { position: newPosition });
  };

  // Update frame
  const handleFrameChange = (id: string, newAttrs: Partial<FrameType>) => {
    setBoardState(prev => ({
      ...prev,
      frames: prev.frames.map(frame =>
        frame.id === id ? { ...frame, ...newAttrs } : frame
      ),
    }));
  };

  // Select frame
  const handleFrameSelect = (id: string) => {
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

  const gridLines = Array.from({ length: numHorizontalLines + numVerticalLines }).map((_, i) => {
    if (i < numHorizontalLines) {
      return {
        points: [0, i * gridSize, stageSize.width, i * gridSize],
      };
    } else {
      return {
        points: [((i - numHorizontalLines) * gridSize), 0, ((i - numHorizontalLines) * gridSize), stageSize.height],
      };
    }
  });

  const handleNotesMove = (noteIds: string[], offset: Position) => {
    setBoardState(prev => ({
      ...prev,
      notes: prev.notes.map(note => 
        noteIds.includes(note.id)
          ? {
              ...note,
              position: {
                x: note.position.x + offset.x,
                y: note.position.y + offset.y,
              },
            }
          : note
      ),
    }));
  };

  const handleDeselect = (e: KonvaEventObject<MouseEvent>) => {
    // Only deselect if clicking on the stage background
    const clickedOnStage = e.target === e.target.getStage();
    if (clickedOnStage) {
      setBoardState(prev => ({
        ...prev,
        selectedId: null
      }));
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#F5F5F5' }}>
      <Toolbar onAddNote={addNote} onAddFrame={addFrame} />
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        ref={stageRef}
        draggable
        onDragStart={handleStageDragStart}
        onDragEnd={handleStageDragEnd}
        x={position.x}
        y={position.y}
        scale={{ x: scale, y: scale }}
        onWheel={handleWheel}
        onClick={handleDeselect}
      >
        <Layer>
          {/* Background */}
          <Rect
            width={stageSize.width}
            height={stageSize.height}
            fill="#ffffff"
          />
          
          {/* Grid */}
          <Group>
            {gridLines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={gridColor}
                strokeWidth={1}
                opacity={gridOpacity}
              />
            ))}
          </Group>

          {/* Frames */}
          {boardState.frames?.map((frame) => (
            <Frame
              key={frame.id}
              {...frame}
              isSelected={frame.id === boardState.selectedId}
              onSelect={() => handleFrameSelect(frame.id)}
              onDragStart={() => handleFrameDragStart(frame.id)}
              onDragEnd={(newPosition) => handleFrameDragEnd(frame.id, newPosition)}
              onChange={(newAttrs) => handleFrameChange(frame.id, newAttrs)}
              stageScale={scale}
              notes={boardState.notes}
              onNotesMove={handleNotesMove}
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
