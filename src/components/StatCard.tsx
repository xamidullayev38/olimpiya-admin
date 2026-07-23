"use client";

import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { IconType } from "react-icons";

const accentHex: Record<string, string> = {
  "gold.400": "#D4A853",
  "signal.green": "#3FB67F",
  "signal.red": "#E5484D",
  "signal.blue": "#4C8DFF",
  "signal.amber": "#E8A23D",
};

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "gold.400",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: IconType;
  accent?: string;
}) {
  const hex = accentHex[accent] ?? accent;
  return (
    <Box
      bg="surface.800"
      border="1px solid"
      borderColor="line.900"
      borderRadius="lg"
      p={5}
      flex={1}
      minW="200px"
    >
      <Flex justify="space-between" align="start">
        <VStack align="start" spacing={1}>
          <Text fontSize="12px" color="ink.500" letterSpacing="0.03em">
            {label}
          </Text>
          <Text fontFamily="heading" fontSize="28px" fontWeight="700" color="ink.900">
            {value}
          </Text>
          {hint && (
            <Text fontSize="12px" color="ink.300">
              {hint}
            </Text>
          )}
        </VStack>
        {Icon && (
          <Flex
            w="34px"
            h="34px"
            borderRadius="7px"
            align="center"
            justify="center"
            bg="canvas.900"
            border="1px solid"
            borderColor="line.900"
          >
            <Icon size={16} color={hex} />
          </Flex>
        )}
      </Flex>
    </Box>
  );
}
