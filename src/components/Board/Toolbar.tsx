import React from 'react';
import { NoteColor } from '../../types/board';

interface ToolbarProps {
  onAddNote: (color: NoteColor) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAddNote }) => {
  const colors: NoteColor[] = ['yellow', 'blue', 'green', 'pink'];
  
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
        gap: '10px',
        zIndex: 1000,
      }}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '8px',
      }}>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
          Add Sticky Note
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {colors.map((color) => (
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

export default Toolbar;
