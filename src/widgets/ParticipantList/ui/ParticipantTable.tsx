import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Flex,
} from "@chakra-ui/react";
import {
  LuChevronDown,
  LuPrinter,
  LuPencil,
  LuBan,
  LuCircleCheck,
} from "react-icons/lu";
import { Participant, BadgeStatus } from "@/shared/types";
import StatusPill from "@/shared/ui/StatusPill/StatusPill";

const statusTone: Record<BadgeStatus, { label: string; tone: "success" | "danger" | "warning" }> = {
  faol: { label: "Faol", tone: "success" },
  bloklangan: { label: "Bloklangan", tone: "danger" },
  muddati_tugagan: { label: "Muddati tugagan", tone: "warning" },
};

const ACC_COLORS: Record<string, { color: string; name: string }> = {
  ATH: { color: "#4C8DFF", name: "Sportchi" },
  COACH: { color: "#3FB67F", name: "Murabbiy" },
  REF: { color: "#E8A23D", name: "Hakam" },
  VOL: { color: "#9C7830", name: "Volontyor" },
  DEL: { color: "#8D96A8", name: "Delegatsiya a'zosi" },
  MEDIA: { color: "#D4A853", name: "Jurnalist" },
  VIP: { color: "#E5484D", name: "VIP mehmon" },
};

export function ParticipantTable({
  participants,
  selectedId,
  onSelect,
  onEdit,
  onToggleBlock,
  onPrint,
}: {
  participants: Participant[];
  selectedId: string;
  onSelect: (p: Participant) => void;
  onEdit: (p: Participant) => void;
  onToggleBlock: (p: Participant) => void;
  onPrint: (p: Participant) => void;
}) {
  return (
    <Box bg="surface.800" border="1px solid" borderColor="line.900" borderRadius="xl" overflow="hidden" className="glass-panel" style={{ background: "rgba(27, 32, 40, 0.4)" }}>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>F.I.Sh</Th>
            <Th>Akkreditatsiya</Th>
            <Th>Tashkilot</Th>
            <Th>Badge ID</Th>
            <Th>Holati</Th>
            <Th isNumeric>Amal</Th>
          </Tr>
        </Thead>
        <Tbody>
          {participants.map((p) => {
            const acc = ACC_COLORS[p.accreditation] || { color: "#2563eb", name: p.accreditation || "Ishtirokchi" };
            const st = statusTone[p.badgeStatus] || { label: "Faol", tone: "success" };
            const active = selectedId === p.id;
            return (
              <Tr
                key={p.id}
                cursor="pointer"
                bg={active ? "surface.700" : "transparent"}
                _hover={{ bg: "surface.700" }}
                onClick={() => onSelect(p)}
              >
                <Td>
                  <Text fontWeight="600" color="ink.900">
                    {p.fullName}
                  </Text>
                  <Text fontSize="11px" color="ink.300">
                    {p.docNumber}
                  </Text>
                </Td>
                <Td>
                  <Badge bg={`${acc.color}22`} color={acc.color} px={2} py={0.5}>
                    {acc.name}
                  </Badge>
                </Td>
                <Td>
                  <Text noOfLines={1} maxW="200px">
                    {p.organization}
                  </Text>
                </Td>
                <Td fontFamily="mono" fontSize="12px">
                  {p.badgeId}
                </Td>
                <Td>
                  <StatusPill label={st.label} tone={st.tone} />
                </Td>
                <Td isNumeric onClick={(e) => e.stopPropagation()}>
                  <Menu>
                    <MenuButton as={Button} size="xs" variant="ghost" rightIcon={<LuChevronDown size={13} />}>
                      Amal
                    </MenuButton>
                    <MenuList bg="surface.700" borderColor="line.900" fontSize="13px" minW="180px">
                      <MenuItem icon={<LuPrinter size={14} />} bg="transparent" _hover={{ bg: "surface.600" }} onClick={() => onPrint(p)}>
                        Badge chop etish
                      </MenuItem>
                      <MenuItem icon={<LuPencil size={14} />} bg="transparent" _hover={{ bg: "surface.600" }} onClick={() => onEdit(p)}>
                        Tahrirlash
                      </MenuItem>
                      <MenuItem
                        icon={p.badgeStatus === "bloklangan" ? <LuCircleCheck size={14} /> : <LuBan size={14} />}
                        bg="transparent"
                        _hover={{ bg: "surface.600" }}
                        color={p.badgeStatus === "bloklangan" ? "signal.green" : "signal.red"}
                        onClick={() => onToggleBlock(p)}
                      >
                        {p.badgeStatus === "bloklangan" ? "Blokdan chiqarish" : "Bloklash"}
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      {participants.length === 0 && (
        <Flex p={8} justify="center">
          <Text color="ink.500" fontSize="14px">
            Qidiruvga mos ishtirokchi topilmadi.
          </Text>
        </Flex>
      )}
    </Box>
  );
}
