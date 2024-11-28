export interface Note {
  note_id: string;
  content: string;
  x_position: number;
  y_position: number;
  color: string;
  width: number;
  height: number;
}

export interface Task {
  task_id: string;
  content: string;
  completed: boolean;
}

export interface TodoList {
  list_id: string;
  title: string;
  tasks: Task[];
  x_position: number;
  y_position: number;
  width: number;
  height: number;
}

export interface Board {
  board_id: string;
  data: {
    notes: Note[];
    todolists: TodoList[];
  }
}