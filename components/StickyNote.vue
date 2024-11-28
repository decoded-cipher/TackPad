<template>
  <div
    :data-note="note.note_id"
    data-item="1"
    ref="noteRef"
    class="sticky-note absolute shadow-lg cursor-move"
    :style="{
      ...style,
      backgroundColor: note.color
    }"
    :class="{ 
      'ring-2 ring-blue-500': isSelected,
      'select-none': isMoving || isResizing 
    }"
    @mousedown="handleMouseDown"
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
      v-show="isSelected && !isMoving"
      class="absolute bottom-2 left-2"
      v-model="selectColor"
    />

    <div v-if="isSelected && !isMoving" class="resize-handles">
      <div
        v-for="handle in resizeHandles"
        :key="handle"
        class="resize-handle"
        :class="handle"
        @mousedown.stop="(e:MouseEvent) => startResize(e, handle)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useEventListener } from '@vueuse/core';
import type { Note } from '~/types/board';
import { useScaleAwareInteractions } from '~/composables/useScaleAwareInteractions';
import { useBoardStore } from '~/stores/board';

const props = defineProps<{
  note: Note;
  isSelected: boolean;
}>();

defineEmits<{
  (e: 'select', id: string): void;
}>();

const boardStore = useBoardStore();
const localContent = ref(props.note.content);
const selectColor = ref("red");
const {
  style,
  isMoving,
  isResizing,
  startMove: handleMouseDown,
  move,
  startResize,
  stopInteraction
} = useScaleAwareInteractions<Note>(
  { x: props.note.x_position, y: props.note.y_position },
  { width: props.note.width, height: props.note.height },
  {
    getScale: () => boardStore.scale,
    onUpdate: (updates) => {
      if (!isMoving.value && !isResizing.value) return;
      boardStore.updateNote(props.note.note_id, {
        x_position: updates.x_position,
        y_position: updates.y_position,
        width: updates.width,
        height: updates.height
      });
    }
  }
);

onMounted(()=> {
  console.log('mounted')
})


const resizeHandles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

watch(() => props.note.content, (newContent) => {
  localContent.value = newContent;
});

const updateContent = () => {
  boardStore.updateNote(props.note.note_id, { content: localContent.value });
};

// const selectColor = (color: string) => {
//   alert(color)
//   boardStore.updateNote(props.note.note_id, { color });
// }

// Set up event listeners for move and resize
useEventListener(window, 'mousemove', move);
useEventListener(window, 'mouseup', stopInteraction);
</script>

<style scoped>
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