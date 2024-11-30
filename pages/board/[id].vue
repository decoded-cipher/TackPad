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
        <template v-if="boardStore.board?.data.items">
          <template v-for="item in boardStore.board.data.items" :key="item.id">
            <StickyNote
            v-if="item.kind === 'note'"
            :note="item"
            :is-selected="boardStore.selectedId === item.id"
            @select="boardStore.setSelectedId"
          />
          <TodoList
             v-if="item.kind === 'todo'"
            :list="item"
            :is-selected="boardStore.selectedId === item.id"
            @select="boardStore.setSelectedId"
          />
          </template>
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
      <button class="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50" @click="showPasswordDialog">🔒</button>
    </div>
    <dialog class="p-4 w-80 md:w-96" ref="passwordRef">
      <button @click="closePasswordDialog" class="absolute top-2 right-2 text-2xl text-gray-500 hover:text-gray-700">
      &times;
    </button>
    <p class="text-lg font-medium mb-4">Enter Password</p>
    <div class="relative w-full">
      <input
        type="password"
        v-model="boardStore.password"
        class="w-full border-2 border-green-400 rounded-md p-2 pl-10 focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder="Password"
      />
      <span class="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500">
        🔒
      </span>
    </div>
    <div class="text-sm mt-2">
      Your data is encrypted and decrypted on your device, ensuring privacy and security. Please remember your password, as it cannot be recovered.
      </div>
    <button
      @click="closePasswordDialog"
      class="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
    >
      Continue
    </button>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { usePanZoom } from '~/composables/usePanZoom';
import { useBoardStore } from '~/stores/board';

definePageMeta({
  alias:'/'
})

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

const {closePasswordDialog, passwordRef, showPasswordDialog} = usePasswordModal()
</script>

<style>
.board-container {
  will-change: transform;
}
</style>