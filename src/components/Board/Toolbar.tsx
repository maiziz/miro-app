import React, { useState } from 'react';
import { HexColorPicker } from "react-colorful";

interface ToolbarProps {
  onAddNote: () => void;
  onAddFrame: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  selectedColor: string;
  onColorChange: (color: string) => void;
  isConnecting: boolean;
  onToggleConnect: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddNote,
  onAddFrame,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  selectedColor,
  onColorChange,
  isConnecting,
  onToggleConnect,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 flex items-center space-x-2 z-10">
      <button
        onClick={onAddNote}
        className="p-2 hover:bg-gray-100 rounded-lg"
        title="Add Note"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      <button
        onClick={onAddFrame}
        className="p-2 hover:bg-gray-100 rounded-lg"
        title="Add Frame"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
        </svg>
      </button>

      <button
        onClick={onToggleConnect}
        className={`p-2 hover:bg-gray-100 rounded-lg ${isConnecting ? 'bg-blue-100' : ''}`}
        title="Connect Notes"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </button>

      <div className="h-6 w-px bg-gray-300" />

      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`p-2 rounded-lg ${canUndo ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
        title="Undo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </button>

      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`p-2 rounded-lg ${canRedo ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
        title="Redo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
        </svg>
      </button>

      <div className="h-6 w-px bg-gray-300" />

      <div className="relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:border-gray-400"
          style={{ backgroundColor: selectedColor }}
          title="Color Picker"
        />
        {showColorPicker && (
          <div 
            className="absolute top-full left-0 mt-2 p-2 bg-white rounded-lg shadow-lg z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <HexColorPicker 
              color={selectedColor} 
              onChange={onColorChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
