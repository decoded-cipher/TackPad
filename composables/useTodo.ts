import { ref, nextTick } from 'vue'
import { useTodoStore } from '~/stores/todoStore'
import { useBoardStore } from '~/stores/board'
import type { TodoList, Task } from '~/types/board'

export const useTodo = (list: TodoList) => {
  const todoStore = useTodoStore()
  const boardStore = useBoardStore()
  
  // Task editing state
  const editingTaskId = ref<string | null>(null)
  const editingContent = ref('')
  const editInput = ref<HTMLInputElement | null>(null)
  
  // Title editing state
  const localTitle = ref(list.content.title)
  const isEditingTitle = ref(false)
  const titleInput = ref<HTMLInputElement | null>(null)
  
  // Drag and drop state
  const draggedItemIndex = ref<number | null>(null)
  const isDragging = ref(false)
  const dropIndex = ref<number | null>(null)
  
  // Title functions
  const startTitleEdit = () => {
    isEditingTitle.value = true
    nextTick(() => {
      titleInput.value?.focus()
    })
  }

  const saveTitle = () => {
    if (localTitle.value.trim() === '') {
      localTitle.value = list.content.title
    } else if (localTitle.value !== list.content.title) {
      todoStore.updateTodoTitle(list.id, localTitle.value)
    }
    isEditingTitle.value = false
  }

  const cancelTitleEdit = () => {
    localTitle.value = list.content.title
    isEditingTitle.value = false
  }
  
  // Task functions
  const addNewTask = (taskContent: string) => {
    if (!taskContent.trim()) return
    todoStore.addTask(list.id, taskContent)
    return ''
  }

  const deleteTask = (task: Task) => {
    todoStore.deleteTask(list.id, task.task_id)
  }

  const toggleTask = (task: Task) => {
    todoStore.toggleTaskCompletion(list.id, task.task_id)
  }

  const startEditing = (task: Task) => {
    editingTaskId.value = task.task_id
    editingContent.value = task.content
    nextTick(() => {
      editInput.value?.focus()
    })
  }

  const saveTaskEdit = (task: Task) => {
    if (editingTaskId.value === null) return
    if (editingContent.value.trim() !== '') {
      todoStore.updateTask(list.id, task.task_id, editingContent.value)
    }
    editingTaskId.value = null
    editingContent.value = ''
  }

  const cancelTaskEdit = () => {
    editingTaskId.value = null
    editingContent.value = ''
  }
  // Drag and drop functions
  const dragStart = (index: number, event: DragEvent) => {
    isDragging.value = true
    draggedItemIndex.value = index
    if(boardStore.fromListId === null){
        boardStore.fromListId = list.id
        // Store the task being dragged
        boardStore.draggedTask = list.content.tasks[index]
    }
    
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', index.toString());
      
      // Find the drag handle element which is the direct child of the li
      const listItem = event.currentTarget as HTMLElement;
      if (listItem) {
        // Calculate offset for better positioning
        const rect = listItem.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        
        // Use the list item itself as the drag image
        event.dataTransfer.setDragImage(listItem, offsetX, offsetY);
      }
    }
  }

  const drop = (dropIndex: number, event: DragEvent) => {
    event.preventDefault()
    
    const target = event.target as HTMLElement
    const targetListId = target.closest('[data-list-id]')?.dataset.listId
   
    if(boardStore.fromListId !== targetListId && targetListId) {
     boardStore.toListId = targetListId 
    }

    // Handle cross-list drag and drop
    if(boardStore.fromListId && boardStore.toListId && boardStore.draggedTask) {
      console.log('from', boardStore.fromListId)
      console.log('to', boardStore.toListId)
      
      // For the target list, add the task
      if(list.id === boardStore.toListId) {
        // Add task to the target list
        todoStore.addTask(list.id, boardStore.draggedTask.content)
        
        // Delete from source list - do this here to ensure it happens
        todoStore.deleteTask(boardStore.fromListId, boardStore.draggedTask.task_id)
      }
    } else {
      // Same-list reordering
      if(draggedItemIndex.value === null) return

      // Create a copy of the tasks array
      const newTasks = [...list.content.tasks]
      
      // Get the task that was being dragged
      const draggedTask = newTasks[draggedItemIndex.value]
      
      // Remove the task from its original position
      newTasks.splice(draggedItemIndex.value, 1)
      
      // Insert the task at the new position
      newTasks.splice(dropIndex, 0, draggedTask)
      
      // Update the store with the new order
      todoStore.reorderTasks(list.id, newTasks)
    }
    
    // Reset the dragged item index
    draggedItemIndex.value = null
    isDragging.value = false
    boardStore.fromListId = null
    boardStore.toListId = null
    boardStore.draggedTask = null
  }

  const dragOver = (index: number) => {
    dropIndex.value = index
  }

  const dragEnd = () => {
    // Clean up any drag state
    isDragging.value = false
    draggedItemIndex.value = null
    dropIndex.value = null
  }

  return {
    // State
    localTitle,
    isEditingTitle,
    titleInput,
    editingTaskId,
    editingContent,
    editInput,
    draggedItemIndex,
    isDragging,
    dropIndex,
    
    // Title functions
    startTitleEdit,
    saveTitle,
    cancelTitleEdit,
    
    // Task functions
    addNewTask,
    deleteTask,
    toggleTask,
    startEditing,
    saveTaskEdit,
    cancelTaskEdit,
    
    // Drag and drop functions
    dragStart,
    drop,
    dragOver,
    dragEnd
  }
}