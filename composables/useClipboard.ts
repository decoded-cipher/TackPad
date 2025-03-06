
import { useBoardStore } from '~/stores/board';
import { useItemManagement } from './useItemManagement';

export function useClipboard() {
  const boardStore = useBoardStore();
  const { updateItemPosition } = useItemManagement();

  const handlePaste = async (e: ClipboardEvent) => {
    // Ignore if user is typing in an input field
    if (
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLTextAreaElement
    ) {
      return;
    }

    e.preventDefault();
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    // Check for text
    const text = clipboardData.getData('text');
    if (text) {
      // Check if it's a URL
      try {
        const url = new URL(text);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          const position = calculateCenterPosition(400, 200);
          await boardStore.addLinkItem(text, {
            x: position.x,
            y: position.y,
            width: 400,
            height: 200,
          });
          return;
        }
      } catch (e) {
        // Not a valid URL, continue to treat as text
      }

      // If it's not a URL, add as a text widget or note
      if (text.length > 100) {
        const position = calculateCenterPosition(300, 200);
        boardStore.addNote(text, {
          x: position.x,
          y: position.y,
          color: 'yellow',
          width: 300,
          height: 200,
        });
      } else {
        const position = calculateCenterPosition(300, 100);
        boardStore.addTextWidget({
          x: position.x,
          y: position.y,
          width: 300,
          height: 100,
        }).then(textWidget => {
          if (textWidget) {
            boardStore.updateItem(textWidget.id, { content: { text } });
          }
        });
      }
    }

    // Check for images
    const items = clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        if (blob) {
          // Handle image paste (this would need to be implemented)
          console.log('Image pasted, handling not implemented yet');
        }
      }
    }
  };

  // Helper function to calculate center position
  const calculateCenterPosition = (width: number, height: number) => {
    return {
      x: -width / 2,
      y: -height / 2,
    };
  };

  return {
    handlePaste
  };
}