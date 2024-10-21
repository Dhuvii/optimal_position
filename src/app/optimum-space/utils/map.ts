export default function map(
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number
): number {
  // This calculates the new value in the range [outputMin, outputMax] based on its relative position in [inputMin, inputMax]
  return (
    outputMin +
    (outputMax - outputMin) * ((value - inputMin) / (inputMax - inputMin))
  );
}
