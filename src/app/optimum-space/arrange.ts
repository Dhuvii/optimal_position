export type Rectangle = {
  width: number;
  height: number;
};

export type PositionedRectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LayoutResult = {
  positionedRectangles: PositionedRectangle[];
  containerWidth: number;
  containerHeight: number;
};

// Utility function to get a random boolean value (for rotation)
function getRandomBoolean(): boolean {
  return Math.random() < 0.5; // 50% chance to return true or false
}

// Function to arrange rectangles tightly without overlap in a container with random rotation
export default function arrangeRectangles(
  rectangles: Rectangle[]
): LayoutResult {
  const positionedRectangles: PositionedRectangle[] = [];
  const margin = 5; // Define margin between rectangles

  // Define initial container size, but it will adjust dynamically
  let containerWidth = 0;
  let containerHeight = 0;

  let currentX = 0;
  let currentY = 0;
  let rowHeight = 0; // Track the height of the tallest rectangle in the current row

  rectangles.forEach((rect) => {
    let width = rect.width;
    let height = rect.height;

    // Randomly decide whether to rotate the rectangle (swap width and height)
    if (getRandomBoolean()) {
      [width, height] = [height, width]; // Swap width and height
    }

    // Check if the rectangle fits in the current row, if not, move to the next row
    if (currentX + width + margin > containerWidth) {
      // Move to the next row
      currentX = 0;
      currentY += rowHeight + margin;
      rowHeight = 0; // Reset the row height for the new row
    }

    // Position the rectangle
    const newRect: PositionedRectangle = {
      x: currentX,
      y: currentY,
      width,
      height,
    };

    // Add the positioned rectangle to the list
    positionedRectangles.push(newRect);

    // Update the current X position and the row height
    currentX += width + margin;
    rowHeight = Math.max(rowHeight, height);

    // Update container width and height to accommodate the new rectangle
    containerWidth = Math.max(containerWidth, currentX);
    containerHeight = Math.max(containerHeight, currentY + rowHeight + margin);
  });

  return {
    positionedRectangles,
    containerWidth,
    containerHeight,
  };
}
