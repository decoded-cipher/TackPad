# User Story: Auto-adjust Board Zoom Level

## Title
As a user, I want the board to automatically adjust its zoom level when loaded so that I can see all items on the board without manually zooming in or out.

## Description
When a user opens a board, the application should automatically calculate and set an appropriate zoom level that ensures all items on the board are visible within the viewport. This provides a better user experience by eliminating the need for manual zoom adjustments upon initial load.

## Acceptance Criteria
1. When a board is loaded:
   - The system should calculate the boundaries of all items on the board
   - Determine the optimal zoom level that fits all items within the viewport
   - Apply the calculated zoom level automatically

2. The auto-zoom should:
   - Show all items completely within the viewport
   - Maintain a small margin around the edges for better visibility
   - Not zoom in too close if items are clustered in a small area
   - Not zoom out too far if items are spread apart

3. The auto-zoom should trigger:
   - When initially loading the board
   - After all items have been loaded
   - Before showing the board to the user

4. After auto-zoom:
   - Users should still be able to manually zoom in/out
   - The board should maintain its center point relative to the items

## Technical Notes
- Calculate the bounding box of all items using their x_position, y_position, width, and height
- Consider the viewport size when calculating the zoom level
- Implement smooth transition to the calculated zoom level
- Ensure the zoom calculation works with different screen sizes and orientations

## Dependencies
- Board item position data
- Viewport dimensions
- Current zoom/scale implementation
