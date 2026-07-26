"use client";

import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { Participant } from "@/shared/types";
import QrGlyph from "@/shared/ui/QrGlyph/QrGlyph";

const ACC_COLORS: Record<string, { color: string; name: string }> = {
  ATH: { color: "#4C8DFF", name: "Sportchi" },
  COACH: { color: "#3FB67F", name: "Murabbiy" },
  REF: { color: "#E8A23D", name: "Hakam" },
  VOL: { color: "#9C7830", name: "Volontyor" },
  DEL: { color: "#8D96A8", name: "Delegatsiya a'zosi" },
  MEDIA: { color: "#D4A853", name: "Jurnalist" },
  VIP: { color: "#E5484D", name: "VIP mehmon" },
};

export default function BadgeCard({
  participant,
  compact = false,
}: {
  participant: Participant;
  compact?: boolean;
}) {
  const acc = ACC_COLORS[participant.accreditation] || {
    color: "#2563eb",
    name: participant.accreditation || "Ishtirokchi",
  };

  const initials = (participant.fullName || "A B")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <Flex
      w={compact ? "260px" : "320px"}
      bg="surface.800"
      border="1px solid"
      borderColor="line.900"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="panel"
    >
      <Box w="8px" bg={acc.color} flexShrink={0} />
      <VStack align="stretch" spacing={compact ? 3 : 4} p={compact ? 3 : 4} flex={1}>
        <Flex justify="space-between" align="flex-start">
          <Text
            fontFamily="mono"
            fontSize="10px"
            color="ink.500"
            letterSpacing="0.08em"
          >
            AKKREDITATSIYA
          </Text>
          <Text
            fontFamily="mono"
            fontSize="10px"
            color={acc.color}
            fontWeight="600"
            letterSpacing="0.06em"
          >
            {participant.accreditation}
          </Text>
        </Flex>

        <Flex gap={3} align="center">
          <Flex
            w={compact ? "44px" : "56px"}
            h={compact ? "44px" : "56px"}
            borderRadius="md"
            bg="surface.600"
            align="center"
            justify="center"
            border="1px solid"
            borderColor="line.900"
            flexShrink={0}
          >
            <Text fontFamily="heading" fontWeight="600" color="ink.500" fontSize={compact ? "sm" : "md"}>
              {initials}
            </Text>
          </Flex>
          <VStack align="start" spacing={0} flex={1} minW={0}>
            <Text
              fontFamily="heading"
              fontWeight="600"
              fontSize={compact ? "sm" : "md"}
              color="ink.900"
              noOfLines={1}
            >
              {participant.fullName}
            </Text>
            <Text fontSize="xs" color="ink.500" noOfLines={1}>
              {acc.name} · {participant.organization || "—"}
            </Text>
          </VStack>
        </Flex>

        <Flex justify="space-between" align="flex-end">
          <VStack align="start" spacing={0}>
            <Text fontFamily="mono" fontSize="xs" color="ink.700">
              {participant.badgeId || "BADGE"}
            </Text>
            <Text fontFamily="mono" fontSize="10px" color="ink.300">
              tkn:{(participant.qrToken || "").slice(0, 10)}…
            </Text>
          </VStack>
          <QrGlyph seed={participant.qrToken || participant.id} size={compact ? 40 : 52} />
        </Flex>
      </VStack>
    </Flex>
  );
}
