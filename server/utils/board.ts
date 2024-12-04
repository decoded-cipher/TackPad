import { Board, BoardItem } from '~/types/board';

interface ItemDimensions {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 20; // Snap to grid size
const MARGIN = 10; // Margin between items
const INITIAL_OFFSET = 20; // Initial offset from top-left

function doesItemOverlap(
  position: Position,
  dimensions: ItemDimensions,
  existingItem: BoardItem
): boolean {
  return !(
    position.x + dimensions.width + MARGIN < existingItem.x_position ||
    position.x > existingItem.x_position + existingItem.width + MARGIN ||
    position.y + dimensions.height + MARGIN < existingItem.y_position ||
    position.y > existingItem.y_position + existingItem.height + MARGIN
  );
}

function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

export function findAvailablePosition(
  boardData: Board['data'],
  dimensions: ItemDimensions
): Position {
  // If board is empty, start from initial offset
  if (!boardData.items || boardData.items.length === 0) {
    return {
      x: snapToGrid(INITIAL_OFFSET),
      y: snapToGrid(INITIAL_OFFSET)
    };
  }

  // Find the bounds of existing items
  const existingItems = boardData.items;
  let maxY = Math.max(...existingItems.map(item => item.y_position + item.height));
  
  // Start searching from the top
  let currentY = INITIAL_OFFSET;
  const maxAttempts = 1000; // Prevent infinite loops
  let attempts = 0;

  while (currentY <= maxY + MARGIN && attempts < maxAttempts) {
    let currentX = INITIAL_OFFSET;

    while (currentX < 3000 && attempts < maxAttempts) { // Arbitrary max width of 3000px
      attempts++;
      
      const position = {
        x: snapToGrid(currentX),
        y: snapToGrid(currentY)
      };

      // Check if this position overlaps with any existing item
      let hasOverlap = false;
      for (const item of existingItems) {
        if (doesItemOverlap(position, dimensions, item)) {
          hasOverlap = true;
          break;
        }
      }

      if (!hasOverlap) {
        return position;
      }

      currentX += GRID_SIZE;
    }

    currentY += GRID_SIZE;
  }

  // If no space found in existing bounds, place below all items
  return {
    x: snapToGrid(INITIAL_OFFSET),
    y: snapToGrid(maxY + MARGIN * 2)
  };
}
