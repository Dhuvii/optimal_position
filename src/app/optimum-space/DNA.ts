import arrangeRectangles, {
  LayoutResult,
  PositionedRectangle,
  Rectangle,
} from "./arrange";
import random from "./utils/random";

export default class DNA {
  public genes: LayoutResult; // genes is now a LayoutResult containing PositionedRectangles
  public fitness: number;

  // Constructor (makes a random DNA)
  constructor(availableRectangles: Rectangle[]) {
    // The genetic sequence is the result of arranging rectangles
    this.genes = arrangeRectangles(availableRectangles);
    this.fitness = 0;
  }

  // Fitness function (returns a floating-point % of "optimal" container area)
  calcFitness() {
    const totalArea = parseFloat(
      this.genes.positionedRectangles
        .reduce((sum, rect) => sum + rect.width * rect.height, 0)
        .toFixed(2)
    );

    const boundingBox = this.calculateBoundingBox(
      this.genes.positionedRectangles
    );

    const containerArea = parseFloat(
      (boundingBox.width * boundingBox.height).toFixed(2)
    );
    this.fitness = containerArea - totalArea;
  }

  // Method to calculate the bounding box of arranged rectangles
  private calculateBoundingBox(rectangles: PositionedRectangle[]): {
    width: number;
    height: number;
  } {
    if (rectangles.length === 0) return { width: 0, height: 0 };

    let minX = Math.min(...rectangles.map((rect) => rect.x));
    let minY = Math.min(...rectangles.map((rect) => rect.y));
    let maxX = Math.max(...rectangles.map((rect) => rect.x + rect.width));
    let maxY = Math.max(...rectangles.map((rect) => rect.y + rect.height));

    return {
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  // Crossover
  crossover(partner: DNA): DNA {
    const child = new DNA([]);

    const minLen = Math.min(
      this.genes.positionedRectangles.length,
      partner.genes.positionedRectangles.length
    );

    const midpoint = Math.floor(random(0, minLen));

    // Half from one, half from the other
    for (let i = 0; i < this.genes.positionedRectangles.length; i++) {
      if (i > midpoint) {
        const alreadyExists = child.genes.positionedRectangles.some(
          (g) =>
            g.width === this.genes.positionedRectangles[i].width &&
            g.height === this.genes.positionedRectangles[i].height
        );
        if (!alreadyExists) {
          child.genes.positionedRectangles.push(
            this.genes.positionedRectangles[i]
          );
        }
      } else {
        const alreadyExists = child.genes.positionedRectangles.some(
          (g) =>
            g.width === partner.genes.positionedRectangles[i].width &&
            g.height === partner.genes.positionedRectangles[i].height
        );
        if (!alreadyExists) {
          child.genes.positionedRectangles.push(
            partner.genes.positionedRectangles[i]
          );
        }
      }
    }

    // Recalculate the layout of the child to ensure valid positioning
    child.genes = arrangeRectangles(child.genes.positionedRectangles);
    child.calcFitness();
    return child;
  }

  // Based on a mutation probability, picks a new random rectangle arrangement
  mutate(mutationRate: number) {
    for (let i = 0; i < this.genes.positionedRectangles.length; i++) {
      if (random(0, 1) < mutationRate) {
        const index = Math.floor(
          random(0, this.genes.positionedRectangles.length)
        );
        const pickedGene = this.genes.positionedRectangles[index];
        if (pickedGene) {
          const alreadyExists = this.genes.positionedRectangles.some(
            (g) =>
              g.width === pickedGene.width && g.height === pickedGene.height
          );
          if (!alreadyExists) {
            // Replace with a new rectangle, but create a PositionedRectangle
            this.genes.positionedRectangles[i] = {
              x: pickedGene.x,
              y: pickedGene.y,
              width: pickedGene.width,
              height: pickedGene.height,
            }; // Assuming x and y will be recalculated in arrangeRectangles
          }
        }
      }
    }

    // Recalculate the layout after mutation
    this.genes = arrangeRectangles(this.genes.positionedRectangles);
  }
}
