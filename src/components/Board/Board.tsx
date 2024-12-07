import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Group, Line } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { v4 as uuidv4 } from 'uuid';
import Toolbar from './Toolbar';
import StickyNote from './StickyNote';
import Frame from './Frame';
import Connection from './Connection';
import { Position, Note, Frame as FrameType, BoardState, BoardHistory, BoardAction, NoteColor, FrameColor, Connection as ConnectionType } from '../../types/board';

const MAX_HISTORY_LENGTH = 50;

const STORAGE_KEY = 'miroboard_state';

const Board: React.FC = () => {
  const [boardHistory, setBoardHistory] = useState<BoardHistory>({
    past: [],
    present: {
      notes: [],
      frames: [],
      connections: [],
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
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingStartId, setConnectingStartId] = useState<string | null>(null);

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
          connections: boardState.connections.filter(conn => conn.id !== boardState.selectedId),
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
        const selectedConnection = boardState.connections.find(conn => conn.id === boardState.selectedId);
        if (selectedNote) {
          localStorage.setItem('clipboard_note', JSON.stringify(selectedNote));
        } else if (selectedFrame) {
          localStorage.setItem('clipboard_frame', JSON.stringify(selectedFrame));
        } else if (selectedConnection) {
          localStorage.setItem('clipboard_connection', JSON.stringify(selectedConnection));
        }
      }

      // Paste note
      if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const clipboardNote = localStorage.getItem('clipboard_note');
        const clipboardFrame = localStorage.getItem('clipboard_frame');
        const clipboardConnection = localStorage.getItem('clipboard_connection');
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
        } else if (clipboardConnection) {
          const connection: ConnectionType = JSON.parse(clipboardConnection);
          const stage = stageRef.current;
          const pointerPosition = stage.getPointerPosition();
          const newConnection: ConnectionType = {
            ...connection,
            id: uuidv4(),
            points: [
              (pointerPosition.x - stage.x()) / scale,
              (pointerPosition.y - stage.y()) / scale,
              (pointerPosition.x - stage.x()) / scale,
              (pointerPosition.y - stage.y()) / scale,
            ],
          };

          const newState = {
            ...boardState,
            connections: [...boardState.connections, newConnection],
            selectedId: newConnection.id,
          };

          pushHistory(newState, {
            type: 'ADD_CONNECTION',
            payload: newConnection,
            timestamp: Date.now(),
            description: 'Added new connection',
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
  const addNote = () => {
    const stage = stageRef.current;
    if (!stage) return;

    // Get the center of the viewport in stage coordinates
    const viewportCenterX = (window.innerWidth / 2 - position.x) / scale;
    const viewportCenterY = (window.innerHeight / 2 - position.y) / scale;

    // Default note size
    const defaultWidth = 200;
    const defaultHeight = 200;

    const note: Note = {
      id: uuidv4(),
      type: 'note',
      position: {
        x: viewportCenterX - defaultWidth / 2,
        y: viewportCenterY - defaultHeight / 2,
      },
      text: 'New Note',
      size: {
        width: defaultWidth,
        height: defaultHeight,
      },
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
      description: 'Added new note',
    });
  };

  // Add frame
  const addFrame = () => {
    const stage = stageRef.current;
    if (!stage) return;

    // Get the center of the viewport in stage coordinates
    const viewportCenterX = (window.innerWidth / 2 - position.x) / scale;
    const viewportCenterY = (window.innerHeight / 2 - position.y) / scale;

    // Default frame size
    const defaultWidth = 300;
    const defaultHeight = 300;

    const frame: FrameType = {
      id: uuidv4(),
      type: 'frame',
      position: {
        x: viewportCenterX - defaultWidth / 2,
        y: viewportCenterY - defaultHeight / 2,
      },
      size: {
        width: defaultWidth,
        height: defaultHeight,
      },
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
      description: 'Added new frame',
    });
  };

  // Handle note drag
  const handleNoteDragStart = (id: string) => {
    setIsDragging(true);
    handleSelect(id);
  };

  const handleNoteDragEnd = (id: string, newPosition: Position) => {
    setIsDragging(false);
    
    const newState = {
      ...boardState,
      notes: boardState.notes.map(note =>
        note.id === id ? { ...note, position: newPosition } : note
      ),
    };

    // Update connection points after note movement
    const updatedState = {
      ...newState,
      connections: newState.connections.map(conn => {
        if (conn.startId === id || conn.endId === id) {
          const startNote = newState.notes.find(note => note.id === conn.startId);
          const endNote = newState.notes.find(note => note.id === conn.endId);
          if (startNote && endNote) {
            return {
              ...conn,
              points: calculateConnectionPoints(startNote, endNote),
            };
          }
        }
        return conn;
      }),
    };

    pushHistory(updatedState, {
      type: 'MOVE_NOTE',
      payload: { id, position: newPosition },
      timestamp: Date.now(),
      description: 'Moved note',
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
  const handleSelect = (id: string | null) => {
    if (isConnecting) {
      if (connectingStartId) {
        finishConnection(id);
      } else {
        startConnection(id);
      }
    } else {
      setBoardHistory(prev => ({
        ...prev,
        present: {
          ...prev.present,
          selectedId: id,
        },
      }));
    }
  };

  // Handle frame drag
  const handleFrameDragStart = (id: string) => {
    setIsDragging(true);
    handleSelect(id);
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
    handleSelect(id);
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
        connections: boardState.connections.map(conn =>
          conn.id === boardState.selectedId
            ? { ...conn, color }
            : conn
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

  const handleNoteTextChange = (id: string, text: string) => {
    const newState = {
      ...boardState,
      notes: boardState.notes.map(note =>
        note.id === id
          ? { ...note, text }
          : note
      ),
    };

    pushHistory(newState, {
      type: 'EDIT_NOTE_TEXT',
      payload: { id, text },
      timestamp: Date.now(),
      description: 'Edited note text',
    });
  };

  const handleFrameTitleChange = (id: string, title: string) => {
    const newState = {
      ...boardState,
      frames: boardState.frames.map(frame =>
        frame.id === id
          ? { ...frame, title }
          : frame
      ),
    };

    pushHistory(newState, {
      type: 'EDIT_FRAME_TITLE',
      payload: { id, title },
      timestamp: Date.now(),
      description: 'Edited frame title',
    });
  };

  const startConnection = (noteId: string | null) => {
    if (!noteId) return;
    setIsConnecting(true);
    setConnectingStartId(noteId);
    setBoardHistory(prev => ({
      ...prev,
      present: {
        ...prev.present,
        selectedId: noteId,
      },
    }));
  };

  const finishConnection = (endId: string | null) => {
    if (!endId || !connectingStartId || connectingStartId === endId) {
      setIsConnecting(false);
      setConnectingStartId(null);
      return;
    }

    const startNote = boardState.notes.find(note => note.id === connectingStartId);
    const endNote = boardState.notes.find(note => note.id === endId);

    if (startNote && endNote) {
      const connection: ConnectionType = {
        id: uuidv4(),
        type: 'connection',
        startId: connectingStartId,
        endId: endId,
        color: selectedColor,
        points: calculateConnectionPoints(startNote, endNote),
      };

      const newState = {
        ...boardState,
        connections: [...boardState.connections, connection],
        selectedId: connection.id,
      };

      pushHistory(newState, {
        type: 'ADD_CONNECTION',
        payload: connection,
        timestamp: Date.now(),
        description: 'Added connection',
      });
    }

    setIsConnecting(false);
    setConnectingStartId(null);
  };

  const calculateConnectionPoints = (startNote: Note, endNote: Note) => {
    const startX = startNote.position.x + (startNote.size?.width || 150) / 2;
    const startY = startNote.position.y + (startNote.size?.height || 150) / 2;
    const endX = endNote.position.x + (endNote.size?.width || 150) / 2;
    const endY = endNote.position.y + (endNote.size?.height || 150) / 2;

    return [startX, startY, endX, endY];
  };

  const updateConnectionPoints = () => {
    const newState = {
      ...boardState,
      connections: boardState.connections.map(conn => {
        const startNote = boardState.notes.find(note => note.id === conn.startId);
        const endNote = boardState.notes.find(note => note.id === conn.endId);

        if (startNote && endNote) {
          return {
            ...conn,
            points: calculateConnectionPoints(startNote, endNote),
          };
        }
        return conn;
      }),
    };

    setBoardHistory(prev => ({
      ...prev,
      present: newState,
    }));
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
        isConnecting={isConnecting}
        onToggleConnect={() => setIsConnecting(!isConnecting)}
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

          {/* Connections */}
          {boardState.connections.map((connection) => (
            <Connection
              key={connection.id}
              {...connection}
              isSelected={boardState.selectedId === connection.id}
              onSelect={() => handleSelect(connection.id)}
            />
          ))}

          {/* Frames */}
          {boardState.frames.map((frame) => (
            <Frame
              key={frame.id}
              {...frame}
              isSelected={boardState.selectedId === frame.id}
              onSelect={() => handleFrameSelect(frame.id)}
              onDragStart={handleFrameDragStart}
              onDragEnd={(newPos) => handleFrameDragEnd(frame.id, newPos)}
              onChange={(newAttrs) => handleFrameChange(frame.id, newAttrs)}
              onTitleChange={(title) => handleFrameTitleChange(frame.id, title)}
              notes={boardState.notes}
              onNotesMove={handleNotesMove}
              stageScale={scale}
            />
          ))}

          {/* Notes */}
          {boardState.notes.map((note) => (
            <StickyNote
              key={note.id}
              {...note}
              isSelected={boardState.selectedId === note.id}
              onSelect={() => {
                if (isConnecting) {
                  if (connectingStartId) {
                    finishConnection(note.id);
                  } else {
                    startConnection(note.id);
                  }
                } else {
                  handleSelect(note.id);
                }
              }}
              onDragStart={handleNoteDragStart}
              onDragEnd={(newPos) => handleNoteDragEnd(note.id, newPos)}
              onChange={(newAttrs) => handleNoteChange(note.id, newAttrs)}
              onTextChange={(text) => handleNoteTextChange(note.id, text)}
              stageScale={scale}
              isConnecting={isConnecting && connectingStartId === note.id}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Board;
