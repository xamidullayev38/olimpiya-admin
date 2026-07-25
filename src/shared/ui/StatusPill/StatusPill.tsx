"use client";

import { HStack, Text } from "@chakra-ui/react";

type Tone = "success" | "danger" | "warning" | "neutral" | "info";

const toneMap: Record<Tone, { bg: string; fg: string; dot: string }> = {
  success: { bg: "signal.greenDim", fg: "signal.green", dot: "signal.green" },
  danger: { bg: "signal.redDim", fg: "signal.red", dot: "signal.red" },
  warning: { bg: "signal.amberDim", fg: "signal.amber", dot: "signal.amber" },
  info: { bg: "signal.blueDim", fg: "signal.blue", dot: "signal.blue" },
  neutral: { bg: "surface.600", fg: "ink.500", dot: "ink.500" },
};

export default function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: Tone;
}) {
  const t = toneMap[tone];
  return (
    <HStack
      spacing={1.5}
      bg={t.bg}
      color={t.fg}
      px={2.5}
      py={1}
      borderRadius="4px"
      display="inline-flex"
      w="fit-content"
    >
      <Text as="span" w="6px" h="6px" borderRadius="full" bg={t.dot} />
      <Text fontSize="xs" fontWeight="600" letterSpacing="0.02em">
        {label}
      </Text>
    </HStack>
  );
}
