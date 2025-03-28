<template>
  
  <div
    class="w-full h-full flex flex-col relative min-h-72 min-w-72"
    :style="{ backgroundColor: color }"
  >
  <!-- <ColorPicker
      v-model="color"
      @update:model-value="updateColor"
      v-if="props.isSelected"
    />

    <!-- <textarea
      v-if="isEditing"
      v-model="text"
      class="w-full h-auto p-6 bg-transparent resize-none focus:outline-none text-lg font-medium leading-tight"
      placeholder="Enter your note"
      @input="onTextareaInput"
      @blur="isEditing = false"
      @mousedown.stop
      ref="textArea"
      style="overflow: hidden;"
    />
    <div
      v-else
      class="w-full h-full p-6 text-xl font-medium leading-tight whitespace-pre-wrap overflow-auto"
      @dblclick.stop="startEditing"
    >
      {{ text || "Enter your note" }}
    </div> -->
    <StickyEditor @update="updateText" :value="text"/>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { useBoardStore } from "~/stores/board";
import { useNoteStore } from "~/stores/noteStore";
import ColorPicker from "~/components/ColorPicker.vue";

const props = defineProps<{
  itemId: string;
  initialText?: string;
  initialColor?: string;
  isSelected: boolean;
}>();

const boardStore = useBoardStore();
const noteStore = useNoteStore();
const text = ref(props.initialText || "");
const color = ref(props.initialColor || "#FFD700");
const isEditing = ref(false);
const textArea = ref<HTMLTextAreaElement | null>(null);

async function startEditing() {
  isEditing.value = true;
  await nextTick();
  textArea.value?.focus();
  adjustTextareaHeight();
}

function updateText(text: string) {
  noteStore.updateNoteContent(props.itemId, { text: text });
}

function updateColor(newColor: string) {
  color.value = newColor;
  noteStore.updateNoteContent(props.itemId, { color: newColor });
}

watch(
  () => props.initialText,
  (newText) => {
    if (newText !== undefined) {
      text.value = newText;
    }
  }
);

watch(
  () => props.initialColor,
  (newColor) => {
    if (newColor !== undefined) {
      color.value = newColor;
    }
  }
);
</script>

<style scoped>
textarea::placeholder {
  color: rgba(0, 0, 0, 0.4);
}
</style>
