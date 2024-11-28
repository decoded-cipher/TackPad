<template>
  <div>
    <NuxtPage />
  </div>
</template>

<style>
html, body {
  overflow: hidden;
  overscroll-behavior: none;
  touch-action: none;
}

/* Global scrollbar styles */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Firefox scrollbar styles */
* {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}
</style>