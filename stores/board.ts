import { defineStore } from 'pinia';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)
import type { Board, Note, TodoList, Task } from '~/types/board';

export const useBoardStore = defineStore('board', {
  state: () => ({
    board: null as Board | null,
    loading: false,
    error: null as string | null,
    selectedId: null as string | null,
    scale: 1,
  }),

  actions: {
    async initializeBoard(boardId: string) {
      this.loading = true;
      try {
        const response = await fetch(`/api/board/${boardId}`);
        if (!response.ok) throw new Error('Failed to load board');
        this.board = await response.json();
      } catch (err) {
        this.error = 'Failed to load board';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    setSelectedId(id: string | null) {
      this.selectedId = id;
    },

    setScale(scale: number) {
      this.scale = scale;
    },

    deleteSelected() {
      if (!this.board || !this.selectedId) return;
      
      this.board.notes = this.board.notes.filter(note => note.note_id !== this.selectedId);
      this.board.todolists = this.board.todolists.filter(list => list.list_id !== this.selectedId);
      this.selectedId = null;
      this.saveBoard();
    },

    updateNote(noteId: string, updates: Partial<Note>) {
      if (!this.board) return;
      
      const note = this.board.notes.find(n => n.note_id === noteId);
      if (note) {
        Object.assign(note, updates);
        this.saveBoard();
      }
    },

    updateTodoList(listId: string, updates: Partial<TodoList>) {
      if (!this.board) return;
      
      const list = this.board.todolists.find(l => l.list_id === listId);
      if (list) {
        Object.assign(list, updates);
        this.saveBoard();
      }
    },

    async addNote(content: string, position: { x: number; y: number; color: string; width: number; height: number }) {
      if (!this.board) return;

      const newNote: Note = {
        note_id: `STICKY-${nanoid(10)}`,
        content,
        x_position: position.x,
        y_position: position.y,
        color: position.color,
        width: position.width,
        height: position.height,
      };

      this.board.notes.push(newNote);
      await this.saveBoard();
      return newNote;
    },

    async addTodoList(position: { x: number; y: number; width: number; height: number }) {
      if (!this.board) return;

      const newList: TodoList = {
        list_id: `TODO-${nanoid(10)}`,
        title: 'Todo List',
        tasks: [],
        x_position: position.x,
        y_position: position.y,
        width: position.width,
        height: position.height,
      };

      this.board.todolists.push(newList);
      await this.saveBoard();
      return newList;
    },

    async addTask(listId: string, content: string) {
      if (!this.board) return;

      const list = this.board.todolists.find(l => l.list_id === listId);
      if (!list) return;

      const newTask: Task = {
        task_id: `TASK-${nanoid(10)}`,
        content,
        completed: false,
      };

      list.tasks.push(newTask);
      await this.saveBoard();
      return newTask;
    },

    async saveBoard() {
      if (!this.board) return;

      try {
        const response = await fetch(`/api/save/${this.board.board_id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.board),
        });

        if (!response.ok) throw new Error('Failed to save board');
      } catch (err) {
        this.error = 'Failed to save board';
        console.error(err);
      }
    },
  },
});