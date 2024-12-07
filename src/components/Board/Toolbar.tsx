import React from 'react';
import { Position } from '../../types/board';

interface ToolbarProps {
  onAddNote: (position: Position) => void;
  onAddFrame: (position: Position) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddNote,
  onAddFrame,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white rounded-lg shadow-lg p-2 z-50">
      <div className="flex items-center gap-2 border-r pr-2">
        <button
          onClick={() => onUndo()}
          disabled={!canUndo}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            !canUndo ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Undo (Ctrl+Z)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 7v6h6" />
            <path d="M3 13c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9H3" />
          </svg>
        </button>
        <button
          onClick={() => onRedo()}
          disabled={!canRedo}
          className={`p-2 rounded hover:bg-gray-100 transition-colors ${
            !canRedo ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Redo (Ctrl+Shift+Z)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 7v6h-6" />
            <path d="M21 13c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9h18" />
          </svg>
        </button>
      </div>
      
      <button
        onClick={() => onAddNote({ x: window.innerWidth / 2 - 75, y: window.innerHeight / 2 - 75 })}
        className="p-2 rounded hover:bg-gray-100 transition-colors"
        title="Add Note"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3h18v18H3zM12 8v8M8 12h8" />
        </svg>
      </button>
      
      <button
        onClick={() => onAddFrame({ x: window.innerWidth / 2 - 150, y: window.innerHeight / 2 - 100 })}
        className="p-2 rounded hover:bg-gray-100 transition-colors"
        title="Add Frame"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      </button>
    </div>
  );
};

export default Toolbar;
