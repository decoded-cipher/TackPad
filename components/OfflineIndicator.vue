<template>
  <Transition name="slide-down">
    <div v-if="isOffline && !dismissed" class="offline-indicator">
      <div class="offline-content">
        <div class="offline-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="1" y1="1" x2="23" y2="23"></line>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
            <line x1="12" y1="20" x2="12.01" y2="20"></line>
          </svg>
        </div>
        <span>You are currently offline. Changes will be saved locally.</span>
        <button @click="dismiss" class="dismiss-button" title="Dismiss">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const isOffline = ref(false)
const dismissed = ref(false)

// Define event handler functions
const handleOnline = () => {
  isOffline.value = false
  dismissed.value = false // Reset dismissed state when back online
}

const handleOffline = () => {
  isOffline.value = true
  dismissed.value = false // Reset dismissed state when offline status changes
}

const dismiss = () => {
  dismissed.value = true
}

// Check initial online status and set up event listeners
onMounted(() => {
  isOffline.value = !navigator.onLine
  
  // Add event listeners for online/offline events
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

// Clean up event listeners
onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
</script>

<style scoped>
.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #f8d7da;
  color: #721c24;
  z-index: 9999;
  padding: 10px 16px;
  display: flex;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.offline-content {
  display: flex;
  align-items: center;
  max-width: 1200px;
  width: 100%;
  position: relative;
}

.offline-icon {
  margin-right: 10px;
  display: flex;
  align-items: center;
}

.dismiss-button {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #721c24;
  opacity: 0.7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease, background-color 0.2s ease;
}

.dismiss-button:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.05);
}

.dismiss-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(114, 28, 36, 0.3);
}

/* Transition animations */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>