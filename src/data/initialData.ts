import { BoardSection } from '../types/board';
import { v4 as uuidv4 } from 'uuid';

export const initialSections: BoardSection[] = [
  {
    id: 'goals',
    title: 'Project Goals & Objectives',
    type: 'goals',
    position: { x: 100, y: 100 },
    items: [
      {
        id: uuidv4(),
        type: 'note',
        content: 'Increase user engagement by 50%',
        color: 'yellow',
        position: { x: 20, y: 20 }
      },
      {
        id: uuidv4(),
        type: 'text',
        content: 'Key success metrics:\n- User retention\n- Feature adoption\n- Customer satisfaction',
        position: { x: 20, y: 240 }
      }
    ]
  },
  {
    id: 'team',
    title: 'Team Assignments',
    type: 'team',
    position: { x: 500, y: 100 },
    items: [
      {
        id: uuidv4(),
        type: 'note',
        content: 'Frontend Development Team',
        color: 'blue',
        position: { x: 20, y: 20 }
      }
    ]
  },
  {
    id: 'timeline',
    title: 'Project Timeline',
    type: 'timeline',
    position: { x: 100, y: 500 },
    items: [
      {
        id: uuidv4(),
        type: 'note',
        content: 'Phase 1: Research & Planning',
        color: 'green',
        position: { x: 20, y: 20 }
      }
    ]
  }
];