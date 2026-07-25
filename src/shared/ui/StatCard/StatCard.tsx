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
      className="glass-panel"
      p={6}
      flex={1}
      minW="240px"
      position="relative"
      overflow="hidden"
      style={{
        background: 'rgba(27, 32, 40, 0.45)',
        boxShadow: `inset 0 0 0 1px rgba(255, 255, 255, 0.05), 0 4px 24px -8px ${hex}40`,
        backdropFilter: 'blur(20px)',
      }}
      transition="all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: `inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 12px 32px -12px ${hex}70`,
      }}
    >
      <Box 
        position="absolute" 
        top="-50%" 
        right="-20%" 
        w="100px" 
        h="100px" 
        bg={hex} 
        filter="blur(50px)" 
        opacity={0.15} 
        borderRadius="full" 
        zIndex={0}
      />
      <Flex justify="space-between" align="start" position="relative" zIndex={1}>
        <VStack align="start" spacing={1.5}>
          <Text fontSize="12px" color="ink.500" letterSpacing="0.04em" fontWeight="500">
            {label}
          </Text>
          <Text fontFamily="heading" fontSize="36px" fontWeight="700" color="ink.900" lineHeight="1.1">
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
            w="42px"
            h="42px"
            borderRadius="12px"
            align="center"
            justify="center"
            style={{
              background: `linear-gradient(135deg, ${hex}15, ${hex}05)`,
              boxShadow: `inset 0 1px 1px ${hex}30, 0 2px 8px ${hex}15`
            }}
          >
            <Icon size={20} color={hex} />
          </Flex>
        )}
      </Flex>
    </Box>
  );
}
