import React, { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from "react-colorful";
import { Position } from '../../types/board';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onClose: () => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, onClose }) => {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      style={{
        position: 'absolute',
        zIndex: 2,
        background: 'white',
        padding: '8px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}
    >
      <HexColorPicker color={color} onChange={onChange} />
    </div>
  );
};

interface ToolbarProps {
  onAddNote: (position: Position) => void;
  onAddFrame: (position: Position) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  selectedColor: string;
  onColorChange: (color: string) => void;
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
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ x: 0, y: 0 });
  const colorButtonRef = useRef<HTMLButtonElement>(null);

  const handleColorButtonClick = () => {
    if (colorButtonRef.current) {
      const rect = colorButtonRef.current.getBoundingClientRect();
      setPickerPosition({
        x: rect.left,
        y: rect.bottom + 5,
      });
      setShowColorPicker(true);
    }
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 flex items-center space-x-2 z-10">
      <button
        onClick={() => onAddNote({ x: window.innerWidth / 2 - 75, y: window.innerHeight / 2 - 75 })}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Add Note"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      <button
        onClick={() => onAddFrame({ x: window.innerWidth / 2 - 150, y: window.innerHeight / 2 - 100 })}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Add Frame"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 8H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-300" />

      <button
        ref={colorButtonRef}
        onClick={handleColorButtonClick}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
        title="Change Color"
      >
        <div
          className="w-6 h-6 rounded-full border-2 border-gray-300"
          style={{ backgroundColor: selectedColor }}
        />
      </button>

      {showColorPicker && (
        <div
          style={{
            position: 'fixed',
            left: `${pickerPosition.x}px`,
            top: `${pickerPosition.y}px`,
          }}
        >
          <ColorPicker
            color={selectedColor}
            onChange={onColorChange}
            onClose={() => setShowColorPicker(false)}
          />
        </div>
      )}

      <div className="w-px h-6 bg-gray-300" />

      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`p-2 rounded-lg transition-colors ${
          canUndo ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'
        }`}
        title="Undo"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 9L4 12M4 12L7 15M4 12H16C18.2091 12 20 13.7909 20 16V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`p-2 rounded-lg transition-colors ${
          canRedo ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'
        }`}
        title="Redo"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 9L20 12M20 12L17 15M20 12H8C5.79086 12 4 13.7909 4 16V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
};

export default Toolbar;
