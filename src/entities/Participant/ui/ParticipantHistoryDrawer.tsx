import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  VStack,
  Flex,
  HStack,
  Badge,
  Text,
} from "@chakra-ui/react";
import { Participant } from "@/shared/types";
import StatusPill from "@/shared/ui/StatusPill/StatusPill";

export function ParticipantHistoryDrawer({
  isOpen,
  onClose,
  participant,
  history,
}: {
  isOpen: boolean;
  onClose: () => void;
  participant: Participant | null;
  history: any[];
}) {
  if (!participant) return null;

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent className="glass-panel" borderLeft="1px solid" borderColor="line.900" borderRadius="0">
        <DrawerCloseButton />
        <DrawerHeader borderBottom="1px solid" borderColor="line.900">
          <Text color="ink.900">{participant.fullName}</Text>
          <Text fontSize="12px" color="ink.500" fontWeight="400">
            Badge yaratilgandan buyon barcha kirish va ovqatlanish tarixi
          </Text>
        </DrawerHeader>
        <DrawerBody py={4}>
          <VStack align="stretch" spacing={0}>
            {history.map((h) => (
              <Flex key={h.id} justify="space-between" align="start" py={3} borderBottom="1px solid" borderColor="line.900" _last={{ borderBottom: "none" }}>
                <VStack align="start" spacing={0.5}>
                  <HStack spacing={2}>
                    <Badge
                      bg={h.kind === "Zona" ? "signal.blueDim" : "signal.amberDim"}
                      color={h.kind === "Zona" ? "signal.blue" : "signal.amber"}
                      fontSize="10px"
                    >
                      {h.kind}
                    </Badge>
                    <Text fontSize="13px" fontWeight="600" color="ink.900">
                      {h.label}
                    </Text>
                  </HStack>
                  {h.reason && (
                    <Text fontSize="12px" color="ink.500">
                      {h.reason}
                    </Text>
                  )}
                  <Text fontFamily="mono" fontSize="11px" color="ink.300">
                    {h.timestamp}
                  </Text>
                </VStack>
                <StatusPill label={h.result === "ruxsat" ? "RUXSAT" : "RAD"} tone={h.result === "ruxsat" ? "success" : "danger"} />
              </Flex>
            ))}
            {history.length === 0 && (
              <Text color="ink.500" fontSize="13px" textAlign="center" py={8}>
                Ushbu ishtirokchi uchun hali tarix yo'q.
              </Text>
            )}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
