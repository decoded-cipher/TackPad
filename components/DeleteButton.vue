<template>
  <button
    class="w-6 h-6 rounded-full border border-gray-200 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white flex items-center justify-center hover:bg-red-50"
    @mousedown.stop="$emit('delete')"
    aria-label="Delete"
  >
    <span class="text-red-500 text-sm">&times;</span>
  </button>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'delete'): void;
}>();
</script>