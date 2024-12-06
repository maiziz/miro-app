import React, { useState } from 'react';
import { BoardSection as BoardSectionType } from '../../types/board';
import { StickyNote } from '../Notes/StickyNote';
import { Connection } from '../Connections/Connection';
import { TextBox } from '../Common/TextBox';
import { Frame } from '../Common/Frame';
import { useBoardStore } from '../../store/boardStore';
import { getSectionIcon } from '../../utils/icons';
import { Plus, X, StickyNote as StickyNoteIcon, Type, Link } from 'lucide-react';

interface BoardSectionProps {
  section: BoardSectionType;
}

export const BoardSection: React.FC<BoardSectionProps> = ({ section }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const updateSectionPosition = useBoardStore((state) => state.updateSectionPosition);
  const updateItemPosition = useBoardStore((state) => state.updateItemPosition);
  const addItem = useBoardStore((state) => state.addItem);
  const removeSection = useBoardStore((state) => state.removeSection);
  const Icon = getSectionIcon(section.type);

  const handleAddNote = () => {
    addItem(section.id, {
      id: crypto.randomUUID(),
      type: 'note',
      content: 'New note',
      color: 'yellow',
      position: { x: 20, y: section.items.length * 100 + 20 }
    });
    setIsMenuOpen(false);
  };

  const handleAddTextBox = () => {
    addItem(section.id, {
      id: crypto.randomUUID(),
      type: 'text',
      content: 'New text box',
      position: { x: 20, y: section.items.length * 100 + 20 }
    });
    setIsMenuOpen(false);
  };

  return (
    <Frame
      className="absolute p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg"
      style={{ 
        left: section.position.x, 
        top: section.position.y,
        minWidth: '320px'
      }}
      onDragEnd={(position) => updateSectionPosition(section.id, position)}
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-800">{section.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => removeSection(section.id)}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="absolute right-4 top-12 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
          <button
            onClick={handleAddNote}
            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 text-left"
          >
            <StickyNoteIcon className="w-4 h-4" />
            Add Note
          </button>
          <button
            onClick={handleAddTextBox}
            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 text-left"
          >
            <Type className="w-4 h-4" />
            Add Text Box
          </button>
        </div>
      )}
      
      <div className="relative min-h-[200px]">
        {section.items.map((item) => {
          if (item.type === 'note') {
            return (
              <StickyNote
                key={item.id}
                note={item}
                onDragEnd={(position) => 
                  updateItemPosition(section.id, item.id, position)
                }
              />
            );
          }
          if (item.type === 'text') {
            return (
              <TextBox
                key={item.id}
                text={item}
                onDragEnd={(position) =>
                  updateItemPosition(section.id, item.id, position)
                }
              />
            );
          }
          if (item.type === 'connection') {
            return (
              <Connection
                key={item.id}
                connection={item}
              />
            );
          }
          return null;
        })}
      </div>
    </Frame>
  );
};