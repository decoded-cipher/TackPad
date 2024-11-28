<template>
  <div
    :data-note="note.note_id"
    data-item="1"
    class="sticky-note absolute shadow-lg cursor-move z-10"
    :style="{
      ...style,
      backgroundColor: note.color
    }"
    :class="{ 
      'ring-2 ring-blue-500': isSelected,
      'select-none': isMoving || isResizing 
    }"
    @mousedown="startMove"
    @click.stop="$emit('select', note.note_id)"
  >
    <div class="p-6 h-full flex flex-col overflow-auto">
      <textarea
        v-model="localContent"
        class="w-full flex-grow bg-transparent resize-none focus:outline-none text-xl font-medium leading-tight"
        placeholder="Enter your note"
        @blur="updateContent"
        @mousedown.stop
        @keydown.delete.stop
      />
    </div>

    <ColorPicker
      v-if="isSelected && !isMoving"
      class="absolute bottom-2 left-2"
      :model-value="note.color"
      @update:model-value="updateNoteColor"
      @click.stop
    />

    <div v-if="isSelected && !isMoving" class="resize-handles">
      <div
        v-for="handle in resizeHandles"
        :key="handle"
        class="resize-handle"
        :class="handle"
        @mousedown.stop="(e: MouseEvent) => startResize(e, handle)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useEventListener } from '@vueuse/core';
import { useScaleAwareInteractions } from '@/composables/useScaleAwareInteractions';
import { useBoardStore } from '@/stores/board';
import ColorPicker from './ColorPicker.vue';

interface Note {
  note_id: string;
  content: string;
  color: string;
  x_position: number;
  y_position: number;
  width: number;
  height: number;
}

const props = defineProps<{
  note: Note;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
}>();

const boardStore = useBoardStore();
const localContent = ref(props.note.content);

const {
  style,
  isMoving,
  isResizing,
  startMove,
  move,
  startResize,
  stopInteraction
} = useScaleAwareInteractions(
  { x: props.note.x_position, y: props.note.y_position },
  { width: props.note.width, height: props.note.height },
  {
    minWidth: 200,
    minHeight: 200,
    grid: 1,
    getScale: () => boardStore.scale,
    onUpdate: (updates) => {
      boardStore.updateNote(props.note.note_id, updates);
    }
  }
);

const resizeHandles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

watch(() => props.note.content, (newContent) => {
  if (newContent !== localContent.value) {
    localContent.value = newContent;
  }
});

const updateContent = () => {
  if (localContent.value !== props.note.content) {
    boardStore.updateNote(props.note.note_id, { content: localContent.value });
  }
};

const updateNoteColor = (newColor: string) => {
  boardStore.updateNote(props.note.note_id, { color: newColor });
};

// Set up event listeners for move and resize
useEventListener(window, 'mousemove', move);
useEventListener(window, 'mouseup', stopInteraction);

// Clean up
onUnmounted(() => {
  stopInteraction();
});
</script>

<style scoped>
.sticky-note {
  min-width: 200px;
  min-height: 200px;
}

/* Custom scrollbar styles */
.overflow-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.resize-handles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 50%;
  pointer-events: all;
  cursor: pointer;
}

.n { top: -5px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
.s { bottom: -5px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
.e { right: -5px; top: 50%; transform: translateY(-50%); cursor: e-resize; }
.w { left: -5px; top: 50%; transform: translateY(-50%); cursor: w-resize; }
.nw { top: -5px; left: -5px; cursor: nw-resize; }
.ne { top: -5px; right: -5px; cursor: ne-resize; }
.sw { bottom: -5px; left: -5px; cursor: sw-resize; }
.se { bottom: -5px; right: -5px; cursor: se-resize; }
</style>