import React from 'react';
import { NoteColor, FrameColor } from '../../types/board';

interface ToolbarProps {
  onAddNote: (color: NoteColor) => void;
  onAddFrame: (color: FrameColor) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAddNote, onAddFrame }) => {
  const noteColors: NoteColor[] = ['yellow', 'blue', 'green', 'pink'];
  const frameColors: FrameColor[] = ['gray', 'blue', 'green', 'purple'];
  
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        background: 'white',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        zIndex: 1000,
      }}
    >
      {/* Sticky Notes Section */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '8px',
      }}>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
          Add Sticky Note
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {noteColors.map((color) => (
            <button
              key={color}
              onClick={() => onAddNote(color)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                border: '2px solid #ddd',
                background: getColorValue(color),
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Frames Section */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '8px',
      }}>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
          Add Frame
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {frameColors.map((color) => (
            <button
              key={color}
              onClick={() => onAddFrame(color)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                border: '2px solid #ddd',
                background: getFrameColorValue(color),
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

function getColorValue(color: NoteColor): string {
  const colorMap = {
    yellow: '#fff9c4',
    blue: '#bbdefb',
    green: '#c8e6c9',
    pink: '#f8bbd0',
  };
  return colorMap[color];
}

function getFrameColorValue(color: FrameColor): string {
  const colorMap = {
    gray: '#F0F0F0',
    blue: '#E3F2FD',
    green: '#E8F5E9',
    purple: '#F3E5F5',
  };
  return colorMap[color];
}

export default Toolbar;
