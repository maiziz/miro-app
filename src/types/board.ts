export type ItemType = 'note' | 'text' | 'connection';
export type SectionType = 'goals' | 'team' | 'timeline' | 'dependencies' | 'ideas' | 'decisions';
export type NoteColor = 'yellow' | 'blue' | 'green' | 'pink';

export interface Position {
  x: number;
  y: number;
}

export interface BoardItem {
  id: string;
  type: ItemType;
  position: Position;
}

export interface Note extends BoardItem {
  type: 'note';
  content: string;
  color: NoteColor;
}

export interface TextBox extends BoardItem {
  type: 'text';
  content: string;
}

export interface Connection extends BoardItem {
  type: 'connection';
  fromId: string;
  toId: string;
}

export interface BoardSection {
  id: string;
  title: string;
  type: SectionType;
  position: Position;
  items: (Note | TextBox | Connection)[];
}