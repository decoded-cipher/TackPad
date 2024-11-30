import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { customAlphabet } from 'nanoid'
import { debounce } from 'lodash'

import type { Board, BoardItem, StickyNote, TodoList, Task } from '~/types/board'

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)

export const useBoardStore = defineStore('board', () => {
  // State
  const board = ref<Board | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedId = ref<string | null>(null)
  const scale = ref(1)
  const password = ref(null)
  // Actions
  const initializeBoard = async (boardId: string = 'create') => {
    loading.value = true
    try {
      const response = await fetch(`/api/board/${boardId}`)
      if (!response.ok) throw new Error('Failed to load board')
      const raw = await response.json()
      if(raw.data.encrypted){
        console.log('encrypted')
        if(!password.value){
          console.log('no password')
          await usePasswordModal().showPasswordDialog()
        }
          try{
            board.value = { board_id: raw.board_id, data: await decrypt(raw.data, password.value!)}
          }catch(e){
            console.log(e)
            alert("Error decrypting")
            window.location.reload()
          }
      } else {
        board.value = raw
      }
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

    board.value.data.items = board.value.data.items.filter(
      item => item.id !== selectedId.value
    )
    selectedId.value = null
    debouncedSaveBoard()
  }

  const updateItem = (itemId: string, updates: Partial<BoardItem>) => {
    if (!board.value) return

    const item = board.value.data.items.find(item => item.id === itemId)
    if (item) {
      Object.assign(item, updates)
      debouncedSaveBoard()
    }
  }

  const addNote = async (
    content: string,
    position: { x: number; y: number; color: string; width: number; height: number }
  ) => {
    if (!board.value) return

    const newNote: StickyNote = {
      id: `STICKY-${nanoid(10)}`,
      kind: 'note',
      content: {
        text: content,
        color: position.color
      },
      x_position: position.x,
      y_position: position.y,
      width: position.width,
      height: position.height,
    }

    board.value.data.items.push(newNote)
    debouncedSaveBoard()
    return newNote
  }

  const addTodoList = async (
    position: { x: number; y: number; width: number; height: number }
  ) => {
    if (!board.value) return

    const newTodo: TodoList = {
      id: `TODO-${nanoid(10)}`,
      kind: 'todo',
      content: {
        title: 'Todo List',
        tasks: []
      },
      x_position: position.x,
      y_position: position.y,
      width: position.width,
      height: position.height,
    }

    board.value.data.items.push(newTodo)
    debouncedSaveBoard()
    return newTodo
  }

  const addTask = async (listId: string, content: string) => {
    if (!board.value) return
    const list = board.value.data.items.find(item => 
      item.id === listId && item.kind === 'todo'
    ) as TodoList | undefined
    
    if (!list) return

    const newTask: Task = {
      task_id: `TASK-${nanoid(10)}`,
      content,
      completed: false,
    }

    list.content.tasks.push(newTask)
    await saveBoard()
    return newTask
  }

  const saveBoard = async () => {
    if (!board.value) return
    let {data, board_id } = unref(board.value)
    let encrypted: EncryptedData = null!;
    if(password.value)
    encrypted = await encrypt(data, password.value)
  console.log({encrypted})
    try {
      const response = await fetch(`/api/save/${board_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({board_id, data:encrypted || data }),
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
    password,

    // Actions
    initializeBoard,
    setSelectedId,
    setScale,
    deleteSelected,
    updateItem,
    addNote,
    addTodoList,
    addTask,
    saveBoard,
  }
})