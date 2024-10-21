import { Rectangle } from "./arrange";
import DNA from "./DNA";
import map from "./utils/map";
import random from "./utils/random";

export default class Population {
  public population: DNA[]; // Array to hold the current population
  private matingPool: DNA[] = []; // Array for the "mating pool"
  private generations: number; // Number of generations
  private finished: boolean; // Are we finished evolving?
  private mutationRate: number; // Mutation rate
  private best: DNA | null;

  constructor(
    mutationRate: number,
    maximumPopulation: number,
    availableRectangles: Rectangle[]
  ) {
    this.generations = 0;
    this.finished = false;
    this.mutationRate = mutationRate;

    this.best = null;

    this.population = [];
    for (let i = 0; i < maximumPopulation; i++) {
      this.population[i] = new DNA(availableRectangles); // Pass available rectangles
    }

    this.matingPool = [];
    this.calcFitness();
  }

  // Fill the fitness array with a value for every member of the population
  calcFitness() {
    for (let i = 0; i < this.population.length; i++) {
      this.population[i].calcFitness();
    }
  }

  // Generate a mating pool based on fitness
  naturalSelection() {
    // Clear the mating pool
    this.matingPool = [];

    // Calculate the maximum fitness
    const maxFitness = Math.max(...this.population.map((ind) => ind.fitness));

    // Based on fitness, add each member to the mating pool a certain number of times
    for (let i = 0; i < this.population.length; i++) {
      const fitness = map(this.population[i].fitness, 0, maxFitness, 0, 1);
      const n = Math.floor(fitness * 100); // Arbitrary multiplier for selection

      // Ensure that at least one individual is added if fitness is greater than zero
      if (n > 0) {
        for (let j = 0; j < n; j++) {
          this.matingPool.push(this.population[i]);
        }
      }
    }

    // Check if the mating pool is still empty
    if (this.matingPool.length === 0) {
      console.error("Mating pool is empty. Check fitness calculation.");
    }
  }

  // Create a new generation
  generate() {
    // Ensure mating pool has enough members to proceed
    if (this.matingPool.length < 2) {
      console.error(
        "Not enough members in mating pool to generate new population."
      );
      return;
    }
    for (let i = 0; i < this.population.length; i++) {
      // Ensure valid random selection from mating pool
      let a = Math.floor(random(0, this.matingPool.length - 1));
      let b = Math.floor(random(0, this.matingPool.length - 1));

      // Ensure both partners are defined
      let partnerA = this.matingPool[a];
      let partnerB = this.matingPool[b];
      if (partnerA && partnerB) {
        let child = partnerA.crossover(partnerB);
        // Pass the available rectangles to the mutate method
        child.mutate(this.mutationRate);
        this.population[i] = child;
      } else {
        console.error(
          "Partner(s) for crossover are undefined. Check mating pool."
        );
      }
    }
    this.generations++;
  }

  // Evaluate the current best individual based on minimum area
  evaluate() {
    let minFitness = Infinity;
    let index = -1;

    // Find the individual with the minimum fitness (area)
    for (let i = 0; i < this.population.length; i++) {
      if (this.population[i].fitness < minFitness) {
        minFitness = this.population[i].fitness;
        index = i;
      }
    }

    this.best = this.population[index];
  }

  // Check if the evolution process is finished
  isFinished() {
    return this.finished;
  }

  // Get number of generations
  getGenerations() {
    return this.generations;
  }

  // Get the entire population
  getPopulation() {
    return this.population;
  }

  // Get the best individual found
  getBest() {
    return this.best;
  }

  // Calculate average fitness of the population
  getAverageFitness() {
    const total = this.population.reduce(
      (sum, individual) => sum + individual.fitness,
      0
    );
    return total / this.population.length;
  }
}
