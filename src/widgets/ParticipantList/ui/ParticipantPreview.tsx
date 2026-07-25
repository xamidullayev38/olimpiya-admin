import { VStack, Text, HStack, Box, Button } from "@chakra-ui/react";
import { LuPrinter, LuPencil, LuBan, LuCircleCheck, LuHistory } from "react-icons/lu";
import BadgeCard from "@/entities/Participant/ui/BadgeCard";
import { Participant } from "@/shared/types";

export function ParticipantPreview({
  participant,
  onPrint,
  onEdit,
  onToggleBlock,
  onOpenHistory,
}: {
  participant: Participant;
  onPrint: () => void;
  onEdit: () => void;
  onToggleBlock: () => void;
  onOpenHistory: () => void;
}) {
  return (
    <VStack w="340px" flexShrink={0} spacing={4} align="stretch" position="sticky" top="88px">
      <Text fontSize="12px" color="ink.500" letterSpacing="0.04em">
        BADGE OLDINDAN KO'RISH
      </Text>
      <BadgeCard participant={participant} />
      <Box className="glass-panel" p={4} style={{background: 'rgba(27, 32, 40, 0.4)'}}>
        <VStack align="stretch" spacing={2.5} fontSize="13px">
          <HStack justify="space-between">
            <Text color="ink.500">Tug'ilgan sana</Text>
            <Text color="ink.900">{participant.birthDate}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text color="ink.500">PINFL</Text>
            <Text fontFamily="mono" color="ink.900">{participant.pinfl}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text color="ink.500">Telefon</Text>
            <Text color="ink.900">{participant.phone}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text color="ink.500">Sport turi</Text>
            <Text color="ink.900">{participant.sport ?? "—"}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text color="ink.500">Ro'yxatga olingan</Text>
            <Text color="ink.900">{participant.createdAt}</Text>
          </HStack>
        </VStack>
      </Box>

      <Button leftIcon={<LuPrinter size={15} />} variant="outline" onClick={onPrint}>
        Ushbu badge PDF sifatida
      </Button>
      <Button leftIcon={<LuPencil size={15} />} variant="outline" onClick={onEdit}>
        Ma'lumotlarni tahrirlash
      </Button>
      <Button
        leftIcon={participant.badgeStatus === "bloklangan" ? <LuCircleCheck size={15} /> : <LuBan size={15} />}
        variant={participant.badgeStatus === "bloklangan" ? "outline" : "danger"}
        onClick={onToggleBlock}
      >
        {participant.badgeStatus === "bloklangan" ? "Blokdan chiqarish" : "Badge'ni bloklash"}
      </Button>
      <Button leftIcon={<LuHistory size={15} />} variant="ghost" onClick={onOpenHistory}>
        To'liq tarixni ko'rish
      </Button>
    </VStack>
  );
}
