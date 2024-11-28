<template>
  <div class="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg p-2 flex gap-2">
    <button
      v-for="color in colors"
      :key="color"
      class="w-6 h-6 rounded-full border border-gray-200 transition-transform hover:scale-110"
      :style="{ backgroundColor: color }"
      @click.stop.prevent="colorModel = color"
    />
  </div>
</template>

<script setup lang="ts">
const colors = [
  '#FFE589', // Yellow
  '#FFB7B7', // Pink
  '#B7E1FF', // Blue
  '#B7FFD8', // Green
  '#E1B7FF', // Purple
  '#FFD700', // Gold
];

const colorModel = defineModel()

onMounted(()=> {
  console.log('mounted')
})
</script>