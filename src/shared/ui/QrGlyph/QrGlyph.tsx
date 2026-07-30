"use client";

import QRCode from "react-qr-code";
import { Box } from "@chakra-ui/react";

export default function QrGlyph({
  seed,
  size = 48,
  color = "#EDEFF3",
}: {
  seed: string;
  size?: number;
  color?: string;
}) {
  return (
    <Box
      bg="white"
      p={1} // Add a small padding (quiet zone) for better scanability
      borderRadius="md"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <QRCode
        value={seed}
        size={size - 8} // Adjust for padding
        level="M" // Medium error correction is usually enough
      />
    </Box>
  );
}
