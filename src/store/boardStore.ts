import { create } from 'zustand';
import { BoardSection, Position, BoardItem } from '../types/board';
import { initialSections } from '../data/initialData';

interface BoardState {
  sections: BoardSection[];
  addSection: (section: BoardSection) => void;
  removeSection: (id: string) => void;
  updateSectionPosition: (id: string, position: Position) => void;
  updateItemPosition: (sectionId: string, itemId: string, position: Position) => void;
  addItem: (sectionId: string, item: BoardItem) => void;
  removeItem: (sectionId: string, itemId: string) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  sections: initialSections,
  
  addSection: (section) =>
    set((state) => ({
      sections: [...state.sections, section]
    })),
    
  removeSection: (id) =>
    set((state) => ({
      sections: state.sections.filter((section) => section.id !== id)
    })),
    
  updateSectionPosition: (id, position) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === id ? { ...section, position } : section
      )
    })),
    
  updateItemPosition: (sectionId, itemId, position) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, position } : item
              )
            }
          : section
      )
    })),
    
  addItem: (sectionId, item) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId
          ? { ...section, items: [...section.items, item] }
          : section
      )
    })),
    
  removeItem: (sectionId, itemId) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.filter((item) => item.id !== itemId)
            }
          : section
      )
    }))
}));