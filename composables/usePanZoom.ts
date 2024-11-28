import { ref, computed } from 'vue';
import { useEventListener } from '@vueuse/core';

export function usePanZoom() {
  const scale = ref(1);
  const translateX = ref(0);
  const translateY = ref(0);
  const isPanning = ref(false);
  const isTouch = ref(false);
  const panStart = ref({ x: 0, y: 0 });
  const lastTranslate = ref({ x: 0, y: 0 });
  const lastDistance = ref(0);

  const handleZoom = (e: WheelEvent) => {
    if (!e.ctrlKey && e.deltaY % 1 === 0) return;
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    updateZoom(delta, e.clientX, e.clientY);
  };

  const updateZoom = (delta: number, centerX: number, centerY: number) => {
    const newScale = Math.min(Math.max(0.25, scale.value * delta), 5);
    
    const zoomPoint = {
      x: (centerX - translateX.value) / scale.value,
      y: (centerY - translateY.value) / scale.value
    };

    scale.value = newScale;
    
    translateX.value = centerX - zoomPoint.x * newScale;
    translateY.value = centerY - zoomPoint.y * newScale;
  };

  const startPan = (e: MouseEvent | TouchEvent) => {
    if (e instanceof MouseEvent && (e.button !== 0 || e.target !== e.currentTarget)) return;
    e.preventDefault();
    
    isPanning.value = true;
    isTouch.value = e instanceof TouchEvent;
    
    if (e instanceof TouchEvent) {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        lastDistance.value = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        panStart.value = {
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2
        };
      } else {
        panStart.value = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    } else {
      panStart.value = { x: e.clientX, y: e.clientY };
    }
    
    lastTranslate.value = { x: translateX.value, y: translateY.value };
  };

  const pan = (e: MouseEvent | TouchEvent | WheelEvent) => {
    if (!isPanning.value && !(e instanceof WheelEvent)) return;
    e.preventDefault();

    if (e instanceof TouchEvent) {
      if (e.touches.length === 2) {
        // Handle pinch zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        const delta = currentDistance / lastDistance.value;
        lastDistance.value = currentDistance;
        
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        
        updateZoom(delta, centerX, centerY);
      } else if (e.touches.length === 1) {
        // Handle single touch pan
        const touch = e.touches[0];
        const dx = touch.clientX - panStart.value.x;
        const dy = touch.clientY - panStart.value.y;
        translateX.value = lastTranslate.value.x + dx;
        translateY.value = lastTranslate.value.y + dy;
      }
      return;
    } else if (e instanceof WheelEvent && !e.ctrlKey) {
      // Handle touchpad scroll
      translateX.value = translateX.value - e.deltaX;
      translateY.value = translateY.value - e.deltaY;
      return;
    }
    
    // Handle mouse pan
    const dx = e.clientX - panStart.value.x;
    const dy = e.clientY - panStart.value.y;
    translateX.value = lastTranslate.value.x + dx;
    translateY.value = lastTranslate.value.y + dy;
  };

  const endPan = () => {
    isPanning.value = false;
    isTouch.value = false;
    lastTranslate.value = { x: translateX.value, y: translateY.value };
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