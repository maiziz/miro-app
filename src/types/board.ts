export type ItemType = 'note' | 'frame' | 'connection' | 'text';
export type SectionType = 'goals' | 'team' | 'timeline' | 'dependencies' | 'ideas' | 'decisions';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Connection {
  id: string;
  type: 'connection';
  startId: string;
  endId: string;
  color: string;
  points: number[];
}

export interface Note {
  id: string;
  type: 'note';
  position: Position;
  text: string;
  size?: Size;
  color: string;
}

export interface Frame {
  id: string;
  type: 'frame';
  position: Position;
  size: Size;
  title: string;
  color: string;
}

export interface TextBox {
  id: string;
  type: 'text';
  content: string;
}

export type BoardItem = Note | Frame | Connection | TextBox;

export interface BoardSection {
  id: string;
  title: string;
  type: SectionType;
  position: Position;
  items: (Note | TextBox | Frame | Connection)[];
}

export interface BoardState {
  sections: BoardSection[];
  notes: Note[];
  frames: Frame[];
  connections: Connection[];
  items: (Note | TextBox | Frame | Connection)[];
  selectedId: string | null;
  isConnecting: boolean;
  connectingStartId: string | null;
}

export interface BoardAction {
  type: string;
  payload: any;
  timestamp: number;
  description: string;
}

export interface BoardHistory {
  past: BoardState[];
  present: BoardState;
  future: BoardState[];
}