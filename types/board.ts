export interface Task {
  task_id: string;
  content: string;
  completed: boolean;
}

interface BaseBoardItem {
  id: string;
  x_position: number;
  y_position: number;
  width: number;
  height: number;
}

export interface StickyNote extends BaseBoardItem {
  kind: 'note';
  content: {
    text: string;
    color: string;
  };
}

export interface TodoList extends BaseBoardItem {
  kind: 'todo';
  content: {
    title: string;
    tasks: Task[];
  };
}


interface BaseContent {
  url: string;
}

interface RegularLinkContent extends BaseContent {
  title: string;
  image: string;
  description: string;
}

interface OEmbedContent extends BaseContent {
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
  html: string;
  type: string;
}

export interface LinkItem extends BaseBoardItem {
  kind: 'link';
  content: RegularLinkContent | OEmbedContent;
}

export type BoardItem = StickyNote | TodoList | LinkItem;

export interface Board {
  board_id: string;
  data: {
    items: BoardItem[];
  }
}