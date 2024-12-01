<template>
    <div
      :data-note="item.id"
      data-item="1"
      class="link-item absolute shadow-lg cursor-move z-10 bg-white rounded-lg overflow-hidden"
      :class="{ 
        'ring-2 ring-blue-500': isSelected,
        'select-none': isMoving || isResizing 
      }"
      :style="style"
      @mousedown="startMove"
      @click.stop="$emit('select', item.id)"
    >
      <!-- Regular Link Content -->
      <template v-if="!isOEmbed">
        <div class="p-4 h-full flex flex-col">
          <img 
            v-if="item.content.image"
            :src="item.content.image" 
            :alt="item.content.title"
            class="w-full h-32 object-cover rounded-md user-select-none"
          />
          <div v-else class="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
            <div class="text-4xl text-gray-400">🔗</div>
          </div>
          <h3 class="mt-3 font-medium text-gray-800 text-lg">{{ item.content.title }}</h3>
          <p v-if="item.content.description === 'Loading metadata...'" class="mt-2 text-sm text-gray-500 flex items-center gap-2">
            <span class="inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></span>
            {{ item.content.description }}
          </p>
          <p v-else-if="item.content.description" class="mt-2 text-sm text-gray-600 line-clamp-4">{{ item.content.description }}</p>
          <p v-else class="mt-2 text-sm text-gray-400 italic">No description available</p>
          <a 
            :href="item.content.url" 
            class="mt-auto pt-2 text-sm text-blue-500 hover:text-blue-600"
            target="_blank"
            @mousedown.stop
          >
            {{ getHostname(item.content.url) }}
          </a>
        </div>
      </template>
  
      <!-- oEmbed Content -->
      <template v-else>
        <div class="p-4 h-full flex flex-col">
          <div 
            v-html="item.content.html" 
            class="w-full h-full flex-grow relative"
            @mousedown.stop
          ></div>
          <a 
            :href="item.content.url" 
            class="mt-2 text-sm text-blue-500 hover:text-blue-600"
            target="_blank"
            @mousedown.stop
          >
            {{ getHostname(item.content.url) }}
          </a>
        </div>
      </template>
  
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
  import { computed } from 'vue';
  import { useEventListener } from '@vueuse/core';
  import { useScaleAwareInteractions } from '@/composables/useScaleAwareInteractions';
  import { useBoardStore } from '@/stores/board';
  
  import type { LinkItem } from '~/types/board';
  
  const props = defineProps<{
    item: LinkItem;
    isSelected: boolean;
  }>();
  
  const emit = defineEmits<{
    (e: 'select', id: string): void;
  }>();
  
  const boardStore = useBoardStore();
  
  const isOEmbed = computed(() => 'html' in props.item.content);
  
  const getHostname = (url: string) => {
    try {
      return new window.URL(url).hostname;
    } catch (e) {
      return url;
    }
  };
  
  const {
    style,
    isMoving,
    isResizing,
    startMove,
    move,
    startResize,
    stopInteraction
  } = useScaleAwareInteractions(
    { x: props.item.x_position, y: props.item.y_position },
    { width: props.item.width, height: props.item.height },
    {
      minWidth: 300,
      minHeight: isOEmbed.value ? 200 : 300,
      grid: 1,
      getScale: () => boardStore.scale,
      onUpdate: (updates) => {
        boardStore.updateItem(props.item.id, updates);
      }
    }
  );
  
  const resizeHandles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
  
  // Set up event listeners for move and resize
  useEventListener(window, 'mousemove', move);
  useEventListener(window, 'mouseup', stopInteraction);
  
  // Clean up
  onUnmounted(() => {
    stopInteraction();
  });
  </script>
  
  <style scoped>
  .link-item {
    min-width: 300px;
    min-height: 300px;
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