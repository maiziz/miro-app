export type ItemType = 'note' | 'frame' | 'text' | 'connection';
export type SectionType = 'goals' | 'team' | 'timeline' | 'dependencies' | 'ideas' | 'decisions';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BoardItem {
  id: string;
  type: ItemType;
  position: Position;
}

export interface Note extends BoardItem {
  type: 'note';
  content: string;
  color: string;
}

export interface TextBox extends BoardItem {
  type: 'text';
  content: string;
}

export interface Frame extends BoardItem {
  type: 'frame';
  title: string;
  color: string;
  size: Size;
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
  items: (Note | TextBox | Frame | Connection)[];
}

export interface BoardState {
  sections: BoardSection[];
  items: (Note | TextBox | Frame | Connection)[];
}

export interface BoardHistory {
  past: BoardState[];
  present: BoardState;
  future: BoardState[];
}

export interface BoardAction {
  type: string;
  payload?: any;
  timestamp: number;
  description: string;
}