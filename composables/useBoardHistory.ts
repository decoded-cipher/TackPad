import { useRefHistory, useDebouncedRefHistory } from '@vueuse/core';
import type { Board } from '~/types/board';

export function useBoardHistory(board: Ref<Board | null>) {
  const { history, undo, redo, canUndo, canRedo, pause, resume } = useDebouncedRefHistory(board, {
    deep: true,
    capacity: 50,
    debounce: 500,
  });

  return {
    history,
    undo,
    redo,
    canUndo,
    canRedo,
    pause,
    resume,
  };
}