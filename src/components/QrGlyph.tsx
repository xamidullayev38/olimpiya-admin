"use client";

// Renders a deterministic grid pattern derived from a string seed.
// It visually stands in for a QR/token badge element in mockups —
// it is not a real, scannable QR code.
function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export default function QrGlyph({
  seed,
  size = 48,
  color = "#EDEFF3",
}: {
  seed: string;
  size?: number;
  color?: string;
}) {
  const cells = 7;
  const cellSize = size / cells;
  const h = hash(seed);
  const rects: React.ReactNode[] = [];

  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      // keep the three finder-pattern corners solid, like a real QR code
      const isFinder =
        (x < 2 && y < 2) ||
        (x > cells - 3 && y < 2) ||
        (x < 2 && y > cells - 3);
      const bit = isFinder ? true : ((h >> ((x * cells + y) % 31)) & 1) === 1;
      if (bit) {
        rects.push(
          <rect
            key={`${x}-${y}`}
            x={x * cellSize}
            y={y * cellSize}
            width={cellSize}
            height={cellSize}
            fill={color}
          />
        );
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Badge token glyph">
      <rect x={0} y={0} width={size} height={size} fill="transparent" />
      {rects}
    </svg>
  );
}
