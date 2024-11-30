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

export type BoardItem = StickyNote | TodoList;

export interface Board {
  board_id: string;
  data: {
    items: BoardItem[];
  }
}