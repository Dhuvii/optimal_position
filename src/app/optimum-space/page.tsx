"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Rectangle } from "./arrange"; // Ensure arrangeRectangles is used appropriately
import Population from "./Population"; // Ensure you import your Population class
import DNA from "./DNA";

const Page = () => {
  const [results, setResults] = useState<
    {
      answer: DNA | null;
      totalGenerations: number;
      totalPopulation: number;
      mutationRate: number;
    }[]
  >([]);
  const [answer, setAnswer] = useState<DNA | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maxGenerations = 500; // Set the maximum number of generations
  const mutationRate = 0.01; // Set mutation rate
  const maximumPopulation = 1500; // Set the size of the population

  const [rectangles, setRectangles] = useState<Rectangle[]>([]);

  const calculate = useCallback(() => {
    if (rectangles.length <= 0) return;
    // Create the initial population
    const population = new Population(
      mutationRate,
      maximumPopulation,
      rectangles
    );

    // Run the genetic algorithm for a number of generations
    for (let i = 0; i < maxGenerations; i++) {
      population.naturalSelection();
      population.generate(); // Pass the available rectangles to generate
      population.evaluate();
      displayInfo();
      setResults((pv) => [
        ...pv,
        {
          answer: population.getBest(),
          totalGenerations: population.getGenerations(),
          totalPopulation: maximumPopulation,
          mutationRate: Math.floor(mutationRate * 100),
        },
      ]);
    }

    // Get the best layout after running the algorithm
    const bestDNA = population.getBest();
    setAnswer(bestDNA);
    console.log({ bestDNA });

    // Setup the canvas to draw the best arrangement
    const canvas = canvasRef.current;

    function displayInfo() {
      console.log({
        answer: population.getBest(),
        totalGenerations: population.getGenerations(),
        totalPopulation: maximumPopulation,
        mutationRate: Math.floor(mutationRate * 100),
      });
    }

    if (canvas && bestDNA) {
      // Ensure bestDNA is defined
      const context = canvas.getContext("2d");
      if (!context) return;

      // Set canvas dimensions based on the best arrangement
      canvas.width = bestDNA.genes.containerWidth;
      canvas.height = bestDNA.genes.containerHeight;

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw each rectangle in the best arrangement
      bestDNA.genes.positionedRectangles.forEach((rect) => {
        context.fillStyle = "lightblue"; // Set color for the rectangle
        context.fillRect(rect.x, rect.y, rect.width, rect.height); // Draw rectangle

        // Optional: Draw rectangle border
        context.strokeStyle = "black";
        context.strokeRect(rect.x, rect.y, rect.width, rect.height);
      });
    }
  }, [rectangles]);

  useEffect(() => {
    calculate();
  }, []);

  const widthRef = useRef<HTMLInputElement>(null);
  const heightRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full h-dvh flex items-start justify-between">
      {/* canvas */}
      <div className="w-[50%] h-dvh flex items-center justify-center">
        <canvas ref={canvasRef} style={{ border: "1px solid black" }} />
      </div>
      {/* canvas */}

      {/* results */}
      <div className="w-[50%] h-dvh p-2 flex flex-col">
        <div className="w-full flex flex-col flex-1 overflow-y-auto p-5 rounded-xl bg-gradient-to-br from-gray-900 to-gray-950">
          <header className="w-full flex items-center justify-between gap-10">
            <div className="">
              <h1 className="text-2xl font-semibold text-white">
                Genetic Results
              </h1>
              <p className="text-xs text-white/50">
                All sequence of genes and its corresponding fitness values
              </p>
            </div>

            <button
              onClick={calculate}
              className="p-3 rounded-xl bg-white text-gray-800 font-medium text-sm hover:bg-white/90 active:scale-95 transition-all duration-300"
            >
              Generate
            </button>
          </header>

          <div className="mt-5">
            <div className="w-full flex items-center justify-between gap-10">
              <div className="w-max text-white">
                <h1 className="text-2xl font-semibold text-white">Add boxes</h1>
                <p className="text-xs text-white/50">
                  You can add / delete boxes
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const { value: width } = widthRef.current || {};
                  const { value: height } = heightRef.current || {};

                  // Validate width and height together in a single condition
                  if (!width || !height || isNaN(+width) || isNaN(+height))
                    return;

                  // Parse width and height once after validation
                  const w = parseFloat(width);
                  const h = parseFloat(height);

                  // Create and update rectangle list
                  const rect: Rectangle = { width: w, height: h };
                  setRectangles((prev) => [...prev, rect]);

                  if (widthRef.current?.value) {
                    widthRef.current.value = "";
                  }

                  if (heightRef.current?.value) {
                    heightRef.current.value = "";
                  }
                }}
                className="flex items-center justify-end gap-3"
              >
                <input
                  ref={widthRef}
                  type="number"
                  placeholder="Enter width"
                  className="px-3 w-32 py-2 bg-transparent border outline-none border-white/60 text-white rounded-xl focus:outline-none focus:ring-2 ring-offset-1 ring-offset-gray-900 focus:ring-white/10"
                />

                <input
                  ref={heightRef}
                  type="number"
                  placeholder="Enter height"
                  className="px-3 w-32 py-2 bg-transparent border outline-none border-white/60 text-white rounded-xl focus:outline-none focus:ring-2 ring-offset-1 ring-offset-gray-900 focus:ring-white/10"
                />

                <button
                  type="submit"
                  className="p-3 rounded-xl bg-white text-gray-800 font-medium text-sm hover:bg-white/90 active:scale-95 transition-all duration-300"
                >
                  Add
                </button>
              </form>
            </div>

            {/* boxes */}
            <div className="mt-5 w-full flex items-center justify-start gap-5 overflow-x-auto font-mono">
              {rectangles.map((rectangle, index) => (
                <div className="bg-white/10 rounded-xl p-3 text-white font-mono text-xs">
                  <pre>{JSON.stringify(rectangle, null, 2)}</pre>

                  <div className="mt-2 flex items-end justify-end">
                    <button
                      onClick={() => {
                        setRectangles((pv) =>
                          pv.filter((_, idx) => idx !== index)
                        );
                      }}
                      className="text-xs text-white hover:underline"
                    >
                      delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {answer && (
            <div className="mt-5">
              <div className="w-full  text-white">
                <h1 className="text-2xl font-semibold text-white">
                  Best Result
                </h1>
                <p className="text-xs text-white/50">
                  This is the finalized result
                </p>
                {/* DNA */}
                <div className="mt-2 w-full flex items-center justify-start gap-5 overflow-x-auto font-mono">
                  {answer?.genes.positionedRectangles.map((pos) => (
                    <div className="bg-white/10 rounded-xl p-3 text-white font-mono text-xs">
                      <pre>{JSON.stringify(pos, null, 2)}</pre>
                    </div>
                  ))}
                </div>
                {/* DNA */}

                <p className="text-xs mt-2">
                  Fitness :{" "}
                  <span className="font-semibold">{answer?.fitness}</span>
                </p>
                <p className="text-xs mt-2">
                  Container width :{" "}
                  <span className="font-semibold">
                    {answer?.genes.containerWidth}
                  </span>
                </p>
                <p className="text-xs">
                  Container height :{" "}
                  <span className="font-semibold">
                    {answer?.genes.containerHeight}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="mt-10 w-full border-t border-white/10 flex-1 space-y-5 divide-y divide-white/10">
            {results.map((r, idx) => (
              <div key={idx} className="w-full font-mono text-white py-5">
                <h3 className="text-base font-medium">Population {idx + 1}</h3>
                {/* DNA */}
                <div className="mt-2 w-full flex items-center justify-start gap-5 overflow-x-auto">
                  {r.answer?.genes.positionedRectangles.map((pos) => (
                    <div className="bg-white/10 rounded-xl p-3 text-white font-mono text-xs">
                      <pre>{JSON.stringify(pos, null, 2)}</pre>
                    </div>
                  ))}
                </div>
                {/* DNA */}

                <p className="text-xs mt-2">
                  Container width :{" "}
                  <span className="font-semibold">
                    {r.answer?.genes.containerWidth}
                  </span>
                </p>
                <p className="text-xs">
                  Container height :{" "}
                  <span className="font-semibold">
                    {r.answer?.genes.containerHeight}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* results */}
    </div>
  );
};

export default Page;
