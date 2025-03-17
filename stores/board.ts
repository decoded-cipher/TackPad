// stores/boardStore.ts
import { ref, computed, unref } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { debounce } from 'lodash'
import { useRoute } from 'vue-router'

// import type { EncryptedData } from '~/types/encryption'
import type { Board, BoardItem, Boards, Task } from '~/types/board'
import { usePasswordDialog } from '~/composables/usePasswordDialog'
import { decrypt, encrypt } from '~/utils/crypto'

export const useBoardStore = defineStore('board', () => {
  // State
  const board = ref<Board | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedId = ref<string | null>(null)
  const scale = ref(1)
  const translateX = ref(0)
  const translateY = ref(0)
  const ZOOM_LEVEL = ref(1) // New reference for tracking zoom levels (1 = overview zoom level)
  const password = ref(null)
  const boards = useLocalStorage<Boards>('boards', {})

  const fromListId = ref<string | null>(null)
  const toListId = ref<string | null>(null)
  const draggedTask = ref<Task | null>(null)

  // Get route at the store level
  const route = useRoute()

  // Actions
  const initializeBoard = async (boardId: string = 'load') => {
    loading.value = true
    
    // Case: 'load' - Load the latest board from local storage
    if(boardId === 'load'){
      const existingBoardIds = Object.keys(boards.value)
      if (existingBoardIds.length > 0) {
        const lastBoardId = boards.value[existingBoardIds[existingBoardIds.length - 1]].board_id
        await navigateTo(`/board/${lastBoardId}`)
        return 
      } else {
        // No boards in local storage, redirect to create
        await navigateTo('/board/create')
        return
      }
    }

    try {
      // Case: 'create' or specific board ID - fetch from API
      const response = await fetch(`/api/board/${boardId}`)
      if (!response.ok) throw new Error('Failed to load board')
      const raw = await response.json()
      
      if(raw.data.encrypted){
        if(!password.value){
          await usePasswordDialog().showPasswordDialog()
        }
        try{
          board.value = { board_id: raw.board_id, data: await decrypt(raw.data, password.value!)}
        } catch(e) {
          console.error(e)
          alert("Error decrypting")
          window.location.reload()
        }
      } else {
        board.value = raw
      }

      // Save to local storage
      boards.value[board.value!.board_id] = {
        board_id: board.value!.board_id, 
        title: board.value?.data.title || 'New TackPad'
      }
  
      // Redirect if needed (for 'create' or when board ID doesn't match route)
      if(boardId === 'create' || (route?.params?.id && route.params.id !== board.value?.board_id)){
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

  const setZoomLevel = (level: number) => {
    ZOOM_LEVEL.value = level
  }

  const setTranslateX = (x: number) => {
    translateX.value = x
  }

  const setTranslateY = (y: number) => {
    translateY.value = y
  }

  const deleteSelected = () => {
    if (!board.value || !selectedId.value) return

    board.value.data.items = board.value.data.items.filter(
      item => item.id !== selectedId.value
    )
    selectedId.value = null
    debouncedSaveBoard()
  }

  const setBoardTitle = (title: string) => {
    if (!board.value) return
    board.value.data.title = title
    boards.value[board.value.board_id].title = title
    debouncedSaveBoard()
  }

  const saveBoard = async () => {
    if (!board.value) return

    let {data, board_id} = unref(board.value)
    let encrypted: any | null = null;
    
    if(password.value) {
      encrypted = await encrypt(data, password.value)
    }
    
    try {
      const response = await fetch(`/api/save/${board_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({board_id, data: encrypted || data}),
      })

      if (!response.ok) throw new Error('Failed to save board')
    } catch (err) {
      error.value = 'Failed to save board'
      console.error(err)
    }
  }

  // Create debounced version of saveBoard
  const debouncedSaveBoard = debounce(saveBoard, 1000)
  
  useHead({
    title: computed(() => `${(board.value?.data.title || 'TackPad')} | TackPad`),
  })
  // initializeBoard()
  // if (useRoute().path === '/') {
  //   initializeBoard()
  // }
  return {
    // State
    board,
    loading,
    error,
    selectedId,
    scale,
    translateX,
    translateY,
    ZOOM_LEVEL,
    password,
    fromListId,
    toListId,
    draggedTask,

    // Actions
    initializeBoard,
    setSelectedId,
    setScale,
    setZoomLevel,
    setTranslateX,
    setTranslateY,
    deleteSelected,
    setBoardTitle,
    saveBoard,
    debouncedSaveBoard,
    boards: computed(() => boards.value),
  }
})