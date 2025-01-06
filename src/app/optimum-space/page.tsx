"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
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
  const maxGenerations = 500;
  const mutationRate = 0.01;
  const maximumPopulation = 1500;

  const [rectangles, setRectangles] = useState<Rectangle[]>([]);

  const calculate = useCallback(() => {
    if (rectangles.length <= 0) return;
    const population = new Population(
      mutationRate,
      maximumPopulation,
      rectangles
    );

    for (let i = 0; i < maxGenerations; i++) {
      population.naturalSelection();
      population.generate();
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

    const bestDNA = population.getBest();
    setAnswer(bestDNA);
    console.log({ bestDNA });

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
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = bestDNA.genes.containerWidth;
      canvas.height = bestDNA.genes.containerHeight;

      context.clearRect(0, 0, canvas.width, canvas.height);

      bestDNA.genes.positionedRectangles.forEach((rect) => {
        context.fillStyle = "lightblue";
        context.fillRect(rect.x, rect.y, rect.width, rect.height);

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

  // Function to handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      // Assuming the first sheet contains the data
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<[number, number]>(sheet, {
        header: 1,
      });

      // Parse rows to create rectangles
      const newRectangles: Rectangle[] = [];
      rows.forEach((row, index) => {
        // Skip header row if present
        if (index === 0) return;

        const [width, height] = row;
        newRectangles.push({ width, height });
      });

      console.log({ newRectangles });

      setRectangles(newRectangles);
    };

    reader.readAsArrayBuffer(file);
  };

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
            <div>
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

          <div className="mt-5 flex justify-end flex-col items-end">
            <h2 className="text-white text-xs">Load Rectangles from Excel</h2>
            <input
              id="file"
              type="file"
              onChange={handleFileUpload}
              className="mt-2 p-2 sr-only rounded-md"
            />

            <button
              onClick={() => document.getElementById("file")?.click()}
              className="mt-1 p-3 rounded-xl bg-white text-gray-800 font-medium text-sm hover:bg-white/90 active:scale-95 transition-all duration-300"
            >
              Load
            </button>
          </div>

          {/* Display rectangles */}
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
    </div>
  );
};

export default Page;
