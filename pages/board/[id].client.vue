
<template>
 <div
    ref="boardRef"
    class="board fixed inset-0 bg-gray-100 bg-[radial-gradient(circle_at_1px_1px,#D1D5DB_1px,transparent_1px)] bg-[size:24px_24px] overflow-hidden"
    :style="{ touchAction: 'none' }"
    @mousedown.stop="startPan"
    @touchstart.stop.prevent="startPan"
    @touchmove.prevent.stop="pan"
    @touchend.stop.prevent="endPan"
    @touchcancel.stop.prevent="endPan"
    @wheel.prevent="pan"
    @mousemove.prevent="pan"
    @mouseup="endPan"
    @mouseleave="endPan"
    @wheel.ctrl.prevent="handleZoom"
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
        top: '-10000px',
        willChange: 'transform',
      }"
    >
      <div
        class="relative w-full h-full"
        :style="{ transform: 'translate(50%, 50%)' }"
      >
        <template v-if="boardStore.board?.data.items">
          <BoardItemWrapper
            v-for="item in boardStore.board.data.items"
            :key="item.id"
            :item-id="item.id"
            :position="{
              x: item.x_position,
              y: item.y_position,
              width: item.width,
              height: item.height,
            }"
            :is-selected="boardStore.selectedId === item.id"
            @select="boardStore.setSelectedId"
            @update:position="(updates) => updateItemPosition(item.id, updates)"
            :shadow="item.kind === 'text'"
          >
            <StickyNote
              v-if="item.kind === 'note'"
              :item-id="item.id"
              :initial-text="item.content.text"
              :initial-color="item.content.color"
              :is-selected="boardStore.selectedId === item.id"
            />
            <TodoList
              v-else-if="item.kind === 'todo'"
              :list="item"
              :is-selected="boardStore.selectedId === item.id"
            />
            <LinkItem
              v-else-if="item.kind === 'link'"
              :item="item"
              :is-selected="boardStore.selectedId === item.id"
            />
            <Timer
              v-else-if="item.kind === 'timer'"
              :is-selected="boardStore.selectedId === item.id"
            />
            <TextWidget
              v-else-if="item.kind === 'text'"
              :item-id="item.id"
              :initial-text="item.content.text"
              :is-selected="boardStore.selectedId === item.id"
              @update:text="
                (text) => boardStore.updateItem(item.id, { content: { text } })
              "
            />
          </BoardItemWrapper>
        </template>
      </div>
    </div>

    <BoardHeader />
    <BoardToolbar />
    <BoardPasswordDialog />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import BoardItemWrapper from "~/components/BoardItemWrapper.vue";

import { usePanZoom } from "~/composables/usePanZoom";
import { useBoard } from "@/composables/useBoard";
import { useItemManagement } from "@/composables/useItemManagement";
import { useClipboard } from "@/composables/useClipboard";
import { applyOptimalZoom } from "@/utils/boardUtils";

// Initialize composables
const route = useRoute();
const { boardStore, initializeCurrentBoard } = useBoard();
const { scale, translateX, translateY, startPan, pan, endPan, handleZoom, updateZoom } = usePanZoom();
const { handleDelete, updateItemPosition } = useItemManagement();
const { handlePaste } = useClipboard();

const boardRef = ref<HTMLElement | null>(null);

// Initialize board
onMounted(async () => {
  await initializeCurrentBoard();
  
  // Apply optimal zoom after board is loaded
  if (boardStore.board?.data.items) {
    // Create a function to set the translation directly
    const setTranslate = (x: number, y: number) => {
      translateX.value = x;
      translateY.value = y;
    };
    
    // Pass the setTranslate function to applyOptimalZoom
    applyOptimalZoom(boardStore.board.data.items, updateZoom, setTranslate);
  }
  
  // Ensure the board element has focus to capture keyboard events
  boardRef.value?.focus();
});
useGlobalShortcuts({
  handleDelete,
  handlePaste
});
</script>

<style>
.board-container {
  will-change: transform;
}
</style>