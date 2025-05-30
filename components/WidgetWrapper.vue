<script setup lang="ts">
import { useItemInteraction } from "~/composables/useItemInteraction";

const props = defineProps<{
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  itemId: string;
  isSelected: boolean;
  shadow?: boolean;
  isLocked?: boolean;
}>();

const emit = defineEmits<{
  (e: "select", id: string): void;
  (e: "update:position", updates: Partial<typeof props.position>): void;
  (e: "delete"): void;
  (e: "parent"): void;
  (e: "lock", locked: boolean): void;
}>();

const {
  style,
  isMoving,
  isResizing,
  elementRef,
  startMove,
  startResize,
  move,
  stopInteraction,
} = useItemInteraction(
  props.position,
  (updates) => {
    const updatedPosition = {
      ...props.position,
      ...updates,
    };
    emit("update:position", updatedPosition);
  },
  {
    minWidth: 200,
    minHeight: 200,
    grid: 1,
  }
);

const showMenu = ref(false);

const toggleMenu = (event: Event) => {
  event.stopPropagation();
  showMenu.value = !showMenu.value;
};

const handleMenuAction = (action: string, event: Event) => {
  event.stopPropagation();
  showMenu.value = false;
  
  if (action === 'lock') {
    emit('lock', !props.isLocked);
    return;
  }
  
  emit(action as "delete" | "parent");
};

// Close menu when clicking outside
const closeMenu = () => {
  showMenu.value = false;
};
</script>

<template>
  <div
    ref="elementRef"
    class="widget-container"
    :class="{
      'widget-selected': isSelected,
      'widget-moving': isMoving,
      'widget-resizing': isResizing,
      'select-none': isMoving || isResizing,
      'widget-locked': props.isLocked,
    }"
    :style="[
      style,
      { touchAction: 'none' }, // Explicitly disable browser touch actions
    ]"
    @pointermove.stop.prevent="move"
    @pointerup.stop="stopInteraction"
    @pointercancel.stop="stopInteraction"
    @pointerleave.stop="stopInteraction"
    @click.stop="$emit('select', props.itemId)"
  >
    <div class="widget-header-minimal">
      <div
        v-if="!props.isLocked"
        class="drag-handle-horizontal"
        title="Drag to move"
        @pointerdown.stop.prevent="startMove"
        @mouseover="showMenu = true"
      ></div>
      <div
        class="widget-controls w-full flex justify-between"
        title="More Options"
      >
        <transition name="fade">
          <div v-if="isSelected" class="widget-menu rounded-xl shadow-lg">
            <button
              @click.stop="handleMenuAction('delete', $event)"
              class="menu-item"
            >
              <img
                src="public/icons/Delete.svg"
                alt="Delete"
                class="h-4 w-4 sm:h-4 sm:w-4"
              />
            </button>
            <button
              @click.stop="handleMenuAction('lock', $event)"
              class="menu-item"
            >
              <img
                src="public/icons/lock.svg"
                alt="Lock"
                class="h-4 w-4 sm:h-4 sm:w-4"
              />
            </button>
          </div>
        </transition>
      </div>
    </div>
    <div class="widget-content">
      <slot></slot>
    </div>
    <div
      v-if="!props.isLocked"
      class="resize-handle"
      title="Resize"
      @pointerdown.stop.prevent="startResize('se', $event)"
    ></div>
  </div>
</template>

<style scoped>
:root {
  --widget-radius: 5px;
  --primary-color: #3498db;
  --text-primary: #333333;
  --text-secondary: #666666;
  --bg-color: #f0f2f5;
  --widget-bg: #ffffff;
  --shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  --transition: all 0.05s ease;
  --handle-bg: rgba(0, 0, 0, 0.2);
}

.widget-container {
  min-width: 320px;
  min-height: 240px;
  width: fit-content;
  height: fit-content;
  position: absolute;
  background: transparent;
  border-radius: var(--widget-radius, 5px);
  /* box-shadow: var(--shadow, 0 10px 25px rgba(0, 0, 0, 0.08)); */
  display: flex;
  flex-direction: column;
  border: none;
  transition: var(--transition, all 0.05s ease);
  will-change: transform;
  user-select: none;
  touch-action: none;
  pointer-events: all;
}

.widget-container:hover {
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.widget-container.widget-selected {
  outline: 1px solid var(--primary-color, #3498db);
  z-index: 11;
}

.widget-container.widget-moving {
  cursor: grabbing;
  opacity: 0.9;
  will-change: transform;
  pointer-events: all;
  z-index: 12; /* Higher z-index when moving to appear on top */
}

.widget-container.widget-resizing {
  cursor: nwse-resize;
  opacity: 0.9;
  will-change: transform, width, height;
  pointer-events: all;
}

.widget-container.widget-locked {
  cursor: default;
}

.widget-header-minimal {
  display: flex;
  padding: 8px 8px;
  background: transparent;
  position: absolute;
  z-index: 10;
  left: 0;
  right: 0;
}

.drag-handle-horizontal {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 8px;
  background: var(--handle-bg, rgba(0, 0, 0, 0.2));
  border-radius: 4px;
  cursor: grab;
  transition: var(--transition, all 0.25s ease);
}

.widget-moving .drag-handle-horizontal {
  cursor: grabbing;
  background: var(--primary-color, #3498db);
}

.widget-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  user-select: text; /* Allow text selection only within content */
}

.select-none {
  user-select: none;
}

.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 16px;
  height: 16px;
  background: transparent;
  cursor: nwse-resize;
  transition: var(--transition, all 0.25s ease);
  z-index: 10;
}

.resize-handle::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 0;
  width: 10px;
  height: 10px;
  background: transparent;
  border-bottom-right-radius: 10px;
  border-right: 4px solid rgba(0, 0, 0, 0.1);
  border-bottom: 4px solid rgba(0, 0, 0, 0.1);
  border-top: none;
  border-left: none;
  z-index: 10;
  transition: var(--transition, all 0.25s ease);
}

.resize-handle:hover::after,
.widget-resizing .resize-handle::after {
  width: 15px;
  height: 15px;
  border-right: 4px solid var(--primary-color, #3498db);
  border-bottom: 4px solid var(--primary-color, #3498db);
}

.widget-menu {
  position: absolute;
  top: -2.75rem;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 20;
  overflow: hidden;
  display: flex;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  transition: background 0.2s;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-item:active {
  background: #e8e8e8;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .drag-handle-horizontal {
    width: 80px;
    height: 12px;
  }

  .resize-handle {
    width: 24px;
    height: 24px;
  }

  .resize-handle::after {
    width: 16px;
    height: 16px;
  }

  .resize-handle:hover::after,
  .widget-resizing .resize-handle::after {
    width: 20px;
    height: 20px;
  }

  .widget-controls button {
    padding: 8px;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.fade-enter-to, .fade-leave-from {
  opacity: 1;
}
</style>
