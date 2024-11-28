<template>
  <div 
    class="fixed inset-0 bg-gray-100 bg-[radial-gradient(circle_at_1px_1px,#D1D5DB_1px,transparent_1px)] bg-[size:24px_24px] overflow-hidden"
    @mousedown="startPan"
    @touchstart.passive="startPan"
    @touchmove.prevent="pan"
    @touchend="endPan"
    @touchcancel="endPan"
    @wheel.prevent.passive="pan"
    @mousemove.prevent="pan"
    @mouseup="endPan"
    @mouseleave="endPan"
    @wheel.ctrl.prevent="handleZoom"
    @keydown.delete="handleDelete"
    @click="boardStore.setSelectedId(null)"
    tabindex="0" 
  >
    <div 
      class="board-container absolute origin-center"
      :style="{
        transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
        width: '20000px',
        height: '20000px',
        left: '-10000px',
        top: '-10000px'
      }"
    > 
      <div class="relative w-full h-full" :style="{ transform: 'translate(50%, 50%)' }">
        <template v-if="boardStore.board">
          <StickyNote
            v-for="note in boardStore.board.data.notes"
            :key="note.note_id"
            :note="note"
            :is-selected="boardStore.selectedId === note.note_id"
            @select="boardStore.setSelectedId"
          />

          <TodoList
            v-for="list in boardStore.board.data.todolists"
            :key="list.list_id"
            :list="list"
            :is-selected="boardStore.selectedId === list.list_id"
            @select="boardStore.setSelectedId"
          />
        </template>
      </div>
    </div>

    <!-- Fixed Controls -->
    <div class="fixed bottom-4 right-4 flex gap-2 items-center">
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


// Add new items
const addNote = () => {
  const position = {
    x: -translateX.value / scale.value + window.innerWidth / (2 * scale.value),
    y: -translateY.value / scale.value + window.innerHeight / (2 * scale.value),
    color: '#FFD700',
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