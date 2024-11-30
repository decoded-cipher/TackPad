<template>
  <div
    :data-list="list.id"
    class="todo-list bg-white rounded-lg shadow-lg absolute cursor-move z-10"
    :class="{ 
      'ring-2 ring-blue-500': isSelected,
      'select-none': isMoving || isResizing 
    }"
    :style="style"
    @mousedown="handleMouseDown"
    @click.stop="$emit('select', list.id)"
  >
    <div class="p-4 border-b flex items-center justify-between">
      <div class="flex items-center gap-2">
        <input
          v-model="localTitle"
          class="text-xl font-semibold bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
          @blur="updateTitle"
          @mousedown.stop
          @keydown.delete.stop
        />
      </div>
    </div>
    
    <div class="p-4 pt-0 overflow-auto" style="max-height: calc(100% - 64px);">
      <div class="bg-gray-50 rounded-lg mb-4 flex items-center">
        <input
          type="text"
          placeholder="Add a new task"
          class="w-full p-4 bg-gray-50 focus:outline-none text-gray-600"
          v-model="newTask"
          @keyup.enter="addNewTask"
          @mousedown.stop
          @keydown.delete.stop
        />
        <button 
          @click.stop="addNewTask"
          class="p-4 text-blue-600 hover:text-blue-800"
        >
          <span class="text-3xl">+</span>
        </button>
      </div>

      <ul class="space-y-4 overflow-y-auto">
        <li 
          v-for="task in list.content.tasks" 
          :key="task.task_id" 
          class="flex items-center gap-3"
        >
          <button 
            class="w-6 h-6 rounded border-2 border-blue-600 flex items-center justify-center"
            :class="{ 'bg-blue-600': task.completed }"
            @click.stop="toggleTask(task)"
          >
            <span v-if="task.completed" class="text-white">✓</span>
          </button>
          <input
            v-model="task.content"
            class="flex-1 focus:outline-none"
            :class="{ 'line-through text-gray-400': task.completed }"
            @blur="debouncedSave"
            @mousedown.stop
            @keydown.delete.stop
          />
        </li>
      </ul>
    </div>

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
import { ref, watch, onUnmounted } from 'vue';
import { useEventListener, useDebounceFn } from '@vueuse/core';
import type { TodoList, Task } from '~/types/board';
import { useScaleAwareInteractions } from '~/composables/useScaleAwareInteractions';
import { useBoardStore } from '~/stores/board';

const props = defineProps<{
  list: TodoList;
  isSelected: boolean;
}>();

defineEmits<{
  (e: 'select', id: string): void;
}>();

const boardStore = useBoardStore();
const localTitle = ref(props.list.content.title);
const newTask = ref('');

const {
  style,
  isMoving,
  isResizing,
  startMove: handleMouseDown,
  move,
  startResize,
  stopInteraction
} = useScaleAwareInteractions(
  { x: props.list.x_position, y: props.list.y_position },
  { width: props.list.width, height: props.list.height },
  {
    minWidth: 200,
    minHeight: 200,
    grid: 1,
    getScale: () => boardStore.scale,
    onUpdate: (updates) => {
      boardStore.updateItem(props.list.id, updates);
    }
  }
);

const resizeHandles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

watch(() => props.list.content.title, (newTitle) => {
  if (newTitle !== localTitle.value) {
    localTitle.value = newTitle;
  }
});

const updateTitle = () => {
  if (localTitle.value !== props.list.content.title) {
    boardStore.updateItem(props.list.id, { content: { ...props.list.content, title: localTitle.value } });
  }
};

const addNewTask = () => {
  if (!newTask.value.trim()) return;
  boardStore.addTask(props.list.id, newTask.value);
  newTask.value = '';
};

const toggleTask = (task: Task) => {
  task.completed = !task.completed;
  debouncedSave();
};

const debouncedSave = useDebounceFn(() => {
  boardStore.updateItem(props.list.id, { 
    content: { 
      ...props.list.content,
      tasks: [...props.list.content.tasks]
    }
  });
}, 500);

// Set up event listeners for move and resize
useEventListener(window, 'mousemove', move);
useEventListener(window, 'mouseup', stopInteraction);

// Clean up
onUnmounted(() => {
  stopInteraction();
});
</script>

<style scoped>
.todo-list {
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