import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Group, Line } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { v4 as uuidv4 } from 'uuid';
import Toolbar from './Toolbar';
import StickyNote from './StickyNote';
import Frame from './Frame';
import { Position, Note, Frame as FrameType, BoardState, BoardHistory, BoardAction, NoteColor, FrameColor } from '../../types/board';

const MAX_HISTORY_LENGTH = 50;

const STORAGE_KEY = 'miroboard_state';

const Board: React.FC = () => {
  const [boardHistory, setBoardHistory] = useState<BoardHistory>({
    past: [],
    present: {
      notes: [],
      frames: [],
      selectedId: null,
    },
    future: [],
  });

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const stageRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [selectedColor, setSelectedColor] = useState('#FFD700');

  // Shorthand for current board state
  const boardState = boardHistory.present;

  // Function to push a new state to history
  const pushHistory = useCallback((newState: BoardState, action: BoardAction) => {
    setBoardHistory(prev => {
      const newPast = [...prev.past, prev.present].slice(-MAX_HISTORY_LENGTH);
      return {
        past: newPast,
        present: newState,
        future: [],
      };
    });
    
    // Log the action for debugging
    console.log(`Action: ${action.type} - ${action.description}`);
  }, []);

  // Undo function
  const handleUndo = useCallback(() => {
    setBoardHistory(prev => {
      if (prev.past.length === 0) return prev;

      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, prev.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  // Redo function
  const handleRedo = useCallback(() => {
    setBoardHistory(prev => {
      if (prev.future.length === 0) return prev;

      const next = prev.future[0];
      const newFuture = prev.future.slice(1);

      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }

      if (e.target instanceof HTMLTextAreaElement) {
        return; // Don't handle shortcuts while editing text
      }

      // Delete selected note
      if ((e.key === 'Delete' || e.key === 'Backspace') && boardState.selectedId) {
        e.preventDefault();
        const newState = {
          ...boardState,
          notes: boardState.notes.filter(note => note.id !== boardState.selectedId),
          frames: boardState.frames.filter(frame => frame.id !== boardState.selectedId),
          selectedId: null,
        };

        pushHistory(newState, {
          type: 'DELETE_ITEM',
          payload: boardState.selectedId,
          timestamp: Date.now(),
          description: 'Deleted item',
        });
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

          const newState = {
            ...boardState,
            notes: [...boardState.notes, newNote],
            selectedId: newNote.id,
          };

          pushHistory(newState, {
            type: 'ADD_NOTE',
            payload: newNote,
            timestamp: Date.now(),
            description: 'Added new note',
          });
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

          const newState = {
            ...boardState,
            frames: [...boardState.frames, newFrame],
            selectedId: newFrame.id,
          };

          pushHistory(newState, {
            type: 'ADD_FRAME',
            payload: newFrame,
            timestamp: Date.now(),
            description: 'Added new frame',
          });
        }
      }

      // Deselect with Escape
      if (e.key === 'Escape') {
        const newState = {
          ...boardState,
          selectedId: null,
        };

        pushHistory(newState, {
          type: 'DESELECT_ITEM',
          payload: null,
          timestamp: Date.now(),
          description: 'Deselected item',
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [boardState.selectedId, scale, handleUndo, handleRedo]);

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
  const addNote = (position: Position) => {
    const note: Note = {
      id: uuidv4(),
      type: 'note',
      position,
      text: 'New note',
      color: selectedColor,
    };

    const newState = {
      ...boardState,
      notes: [...boardState.notes, note],
      selectedId: note.id,
    };

    pushHistory(newState, {
      type: 'ADD_NOTE',
      payload: note,
      timestamp: Date.now(),
      description: 'Added note',
    });
  };

  // Add frame
  const addFrame = (position: Position) => {
    const frame: FrameType = {
      id: uuidv4(),
      type: 'frame',
      position,
      size: { width: 300, height: 200 },
      title: 'New Frame',
      color: selectedColor,
    };

    const newState = {
      ...boardState,
      frames: [...boardState.frames, frame],
      selectedId: frame.id,
    };

    pushHistory(newState, {
      type: 'ADD_FRAME',
      payload: frame,
      timestamp: Date.now(),
      description: 'Added frame',
    });
  };

  // Handle note drag
  const handleNoteDragStart = (id: string) => {
    setIsDragging(true);
    handleNoteSelect(id);
  };

  const handleNoteDragEnd = (id: string, newPosition: Position) => {
    setIsDragging(false);
    const newState = {
      ...boardState,
      notes: boardState.notes.map(note =>
        note.id === id ? { ...note, position: newPosition } : note
      ),
    };

    pushHistory(newState, {
      type: 'MOVE_ITEM',
      payload: { id, position: newPosition },
      timestamp: Date.now(),
      description: 'Moved item',
    });
  };

  // Update note
  const handleNoteChange = (id: string, newAttrs: Partial<Note>) => {
    const newState = {
      ...boardState,
      notes: boardState.notes.map(note =>
        note.id === id ? { ...note, ...newAttrs } : note
      ),
    };

    pushHistory(newState, {
      type: 'UPDATE_ITEM',
      payload: { id, attrs: newAttrs },
      timestamp: Date.now(),
      description: 'Updated item properties',
    });
  };

  // Select note
  const handleNoteSelect = (id: string) => {
    if (!isDragging) {
      const newState = {
        ...boardState,
        selectedId: id,
      };

      pushHistory(newState, {
        type: 'SELECT_ITEM',
        payload: id,
        timestamp: Date.now(),
        description: 'Selected item',
      });
    }
  };

  // Handle frame drag
  const handleFrameDragStart = (id: string) => {
    setIsDragging(true);
    handleFrameSelect(id);
  };

  const handleFrameDragEnd = (id: string, newPosition: Position) => {
    setIsDragging(false);
    
    // Get the final state after all note movements
    const newState = {
      ...boardState,
      frames: boardState.frames.map(frame =>
        frame.id === id ? { ...frame, position: newPosition } : frame
      ),
    };

    // Push the final state to history
    pushHistory(newState, {
      type: 'MOVE_FRAME_WITH_NOTES',
      payload: { frameId: id, position: newPosition },
      timestamp: Date.now(),
      description: 'Moved frame with overlapping notes',
    });
  };

  // Update frame
  const handleFrameChange = (id: string, newAttrs: Partial<FrameType>) => {
    const newState = {
      ...boardState,
      frames: boardState.frames.map(frame =>
        frame.id === id ? { ...frame, ...newAttrs } : frame
      ),
    };

    pushHistory(newState, {
      type: 'UPDATE_ITEM',
      payload: { id, attrs: newAttrs },
      timestamp: Date.now(),
      description: 'Updated item properties',
    });
  };

  // Select frame
  const handleFrameSelect = (id: string) => {
    if (!isDragging) {
      const newState = {
        ...boardState,
        selectedId: id,
      };

      pushHistory(newState, {
        type: 'SELECT_ITEM',
        payload: id,
        timestamp: Date.now(),
        description: 'Selected item',
      });
    }
  };

  // Handle note movement during frame drag
  const handleNotesMove = (noteIds: string[], offset: Position) => {
    const newState = {
      ...boardState,
      notes: boardState.notes.map(note => 
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
    };

    // Update state without pushing to history during drag
    setBoardHistory(prev => ({
      ...prev,
      present: newState,
    }));
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    
    if (boardState.selectedId) {
      const newState = {
        ...boardState,
        notes: boardState.notes.map(note =>
          note.id === boardState.selectedId
            ? { ...note, color }
            : note
        ),
        frames: boardState.frames.map(frame =>
          frame.id === boardState.selectedId
            ? { ...frame, color }
            : frame
        ),
      };

      pushHistory(newState, {
        type: 'CHANGE_COLOR',
        payload: { id: boardState.selectedId, color },
        timestamp: Date.now(),
        description: 'Changed item color',
      });
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

  const handleDeselect = (e: KonvaEventObject<MouseEvent>) => {
    // Only deselect if clicking directly on the stage or background
    const clickedOnStage = e.target === e.target.getStage();
    const clickedOnBackground = e.target.name() === 'background';
    
    if ((clickedOnStage || clickedOnBackground) && !isDragging) {
      const newState = {
        ...boardState,
        selectedId: null,
      };

      pushHistory(newState, {
        type: 'DESELECT_ITEM',
        payload: null,
        timestamp: Date.now(),
        description: 'Deselected item',
      });
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#F5F5F5' }}>
      <Toolbar 
        onAddNote={addNote} 
        onAddFrame={addFrame}
        canUndo={boardHistory.past.length > 0}
        canRedo={boardHistory.future.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        selectedColor={selectedColor}
        onColorChange={handleColorChange}
      />
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
          {/* Background with name for deselection */}
          <Rect
            name="background"
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
