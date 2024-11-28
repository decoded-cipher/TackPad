<template>
  <div 
    class="min-h-screen bg-[#F9FAFB] overflow-hidden"
    @mousedown="startPan"
    @mousemove="pan"
    @mouseup="endPan"
    @wheel.prevent="handleZoom"
    @keydown.delete="handleDelete"
    @click="boardStore.setSelectedId(null)"
    tabindex="0"
  >
    <div 
      class="board-container relative w-full h-screen"
      :style="{
        transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
        transformOrigin: '0 0',
        backgroundImage: 'radial-gradient(circle, #ddd 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }"
    >
      <div class="relative" style="min-height: calc(100vh - 2rem)">
        <template v-if="boardStore.board">
          <StickyNote
            v-for="note in boardStore.board.notes"
            :key="note.note_id"
            :note="note"
            :is-selected="boardStore.selectedId === note.note_id"
            @select="boardStore.setSelectedId"
          />

          <TodoList
            v-for="list in boardStore.board.todolists"
            :key="list.list_id"
            :list="list"
            :is-selected="boardStore.selectedId === list.list_id"
            @select="boardStore.setSelectedId"
          />
        </template>
      </div>
    </div>

    <!-- Fixed Controls -->
    <div class="fixed bottom-4 right-4 flex gap-2">
      <button
        class="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50"
        @click.stop="addNote"
      >
        Add Note
      </button>
      <button
        class="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50"
        @click.stop="addTodoList"
      >
        Add Todo List
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePanZoom } from '~/composables/usePanZoom';
import { useBoardStore } from '~/stores/board';
import { useBoardHistory } from '~/composables/useBoardHistory';

const route = useRoute();
const boardStore = useBoardStore();

// Initialize board
onMounted(async () => {
  const boardId = route.params.id as string;
  await boardStore.initializeBoard(boardId);
  // Clear selection on mount
  boardStore.setSelectedId(null);
});

// Pan and zoom functionality
const { scale, translateX, translateY, startPan, pan, endPan, handleZoom } = usePanZoom();

// Update board store scale when zooming
watch(scale, (newScale) => {
  boardStore.setScale(newScale);
});

// Board history
const { undo, redo, canUndo, canRedo } = useBoardHistory(computed(() => boardStore.board));

// Handle keyboard shortcuts
onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
      if (e.shiftKey && canRedo.value) {
        redo();
      } else if (canUndo.value) {
        undo();
      }
    }
  });
});

// Add new items
const addNote = () => {
  const position = {
    x: -translateX.value / scale.value + window.innerWidth / (2 * scale.value),
    y: -translateY.value / scale.value + window.innerHeight / (2 * scale.value),
    color: '#FFE589',
    width: 300,
    height: 300,
  };
  boardStore.addNote('', position);
};

const addTodoList = () => {
  const position = {
    x: -translateX.value / scale.value + window.innerWidth / (2 * scale.value),
    y: -translateY.value / scale.value + window.innerHeight / (2 * scale.value),
    width: 350,
    height: 400,
  };
  boardStore.addTodoList(position);
};

const handleDelete = (e: KeyboardEvent) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
    return;
  }
  boardStore.deleteSelected();
};
</script>

<style>
.board-container {
  will-change: transform;
}
</style>