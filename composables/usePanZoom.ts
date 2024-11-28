import { ref } from 'vue';
import { useEventListener } from '@vueuse/core';

export function usePanZoom() {
  const scale = ref(1);
  const translateX = ref(0);
  const translateY = ref(0);
  const isPanning = ref(false);
  const startX = ref(0);
  const startY = ref(0);
  const lastTranslateX = ref(0);
  const lastTranslateY = ref(0);

  const handleZoom = (e: WheelEvent) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(0.5, scale.value * delta), 3);
    
    // Calculate mouse position relative to the page
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Calculate new positions to zoom towards mouse
    const scaleChange = newScale - scale.value;
    translateX.value -= ((mouseX - translateX.value) * scaleChange) / scale.value;
    translateY.value -= ((mouseY - translateY.value) * scaleChange) / scale.value;
    
    scale.value = newScale;
  };

  const startPan = (e: MouseEvent) => {
    if (e.button !== 0 || e.target !== e.currentTarget) return;
    e.preventDefault();
    isPanning.value = true;
    startX.value = e.clientX - translateX.value;
    startY.value = e.clientY - translateY.value;
    lastTranslateX.value = translateX.value;
    lastTranslateY.value = translateY.value;
  };

  const pan = (e: MouseEvent) => {
    if (!isPanning.value) return;
    translateX.value = e.clientX - startX.value;
    translateY.value = e.clientY - startY.value;
  };

  const endPan = () => {
    isPanning.value = false;
  };

  return {
    scale,
    translateX,
    translateY,
    isPanning,
    startPan,
    pan,
    endPan,
    handleZoom
  };
}