import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { customAlphabet } from 'nanoid'
import { debounce } from 'lodash'

import type { Board, Note, TodoList, Task } from '~/types/board'

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)

export const useBoardStore = defineStore('board', () => {
  // State
  const board = ref<Board | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedId = ref<string | null>(null)
  const scale = ref(1)

  // Actions
  const initializeBoard = async (boardId: string) => {
    loading.value = true
    try {
      const response = await fetch(`/api/board/${boardId}`)
      if (!response.ok) throw new Error('Failed to load board')
      board.value = await response.json()
      const route = useRoute()
      if(route.params.id !== board.value?.board_id){
        await navigateTo(`/board/${board.value?.board_id}`)
      }
    } catch (err) {
      error.value = 'Failed to load board'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const setSelectedId = (id: string | null) => {
    selectedId.value = id
  }

  const setScale = (newScale: number) => {
    scale.value = newScale
  }

  const deleteSelected = () => {
    if (!board.value || !selectedId.value) return

    board.value.data.notes = board.value.data.notes.filter(
      note => note.note_id !== selectedId.value
    )
    board.value.data.todolists = board.value.data.todolists.filter(
      list => list.list_id !== selectedId.value
    )
    selectedId.value = null
    debouncedSaveBoard()
  }

  const updateNote = (noteId: string, updates: Partial<Note>) => {
    if (!board.value) return

    const note = board.value.data.notes.find(n => n.note_id === noteId)
    if (note) {
      Object.assign(note, updates)
      debouncedSaveBoard()
    }
  }

  const updateTodoList = (listId: string, updates: Partial<TodoList>) => {
    if (!board.value) return

    const list = board.value.data.todolists.find(l => l.list_id === listId)
    if (list) {
      Object.assign(list, updates)
      debouncedSaveBoard()
    }
  }

  const addNote = async (
    content: string,
    position: { x: number; y: number; color: string; width: number; height: number }
  ) => {
    if (!board.value) return

    const newNote: Note = {
      note_id: `STICKY-${nanoid(10)}`,
      content,
      x_position: position.x,
      y_position: position.y,
      color: position.color,
      width: position.width,
      height: position.height,
    }

    board.value.data.notes.push(newNote)
    await saveBoard()
    return newNote
  }

  const addTodoList = async (
    position: { x: number; y: number; width: number; height: number }
  ) => {
    if (!board.value) return

    const newList: TodoList = {
      list_id: `TODO-${nanoid(10)}`,
      title: 'Todo List',
      tasks: [],
      x_position: position.x,
      y_position: position.y,
      width: position.width,
      height: position.height,
    }

    board.value.data.todolists.push(newList)
    await saveBoard()
    return newList
  }

  const addTask = async (listId: string, content: string) => {
    if (!board.value) return
    const list = board.value.data.todolists.find(l => l.list_id === listId)
    if (!list) return

    const newTask: Task = {
      task_id: `TASK-${nanoid(10)}`,
      content,
      completed: false,
    }

    list.tasks.push(newTask)
    await saveBoard()
    return newTask
  }

  const saveBoard = async () => {
    if (!board.value) return

    try {
      const response = await fetch(`/api/save/${board.value.board_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(board.value),
      })

      if (!response.ok) throw new Error('Failed to save board')
    } catch (err) {
      error.value = 'Failed to save board'
      console.error(err)
    }
  }

  // Create debounced version of saveBoard
  const debouncedSaveBoard = debounce(saveBoard, 1000)

  return {
    // State
    board,
    loading,
    error,
    selectedId,
    scale,

    // Actions
    initializeBoard,
    setSelectedId,
    setScale,
    deleteSelected,
    updateNote,
    updateTodoList,
    addNote,
    addTodoList,
    addTask,
    saveBoard,
  }
})