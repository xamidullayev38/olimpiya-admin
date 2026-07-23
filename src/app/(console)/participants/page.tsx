"use client";

import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Badge,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { LuSearch, LuUpload, LuPlus, LuPrinter } from "react-icons/lu";
import Topbar from "@/components/Topbar";
import StatusPill from "@/components/StatusPill";
import BadgeCard from "@/components/BadgeCard";
import { participants, accreditationTypes, accreditationByCode } from "@/lib/mock-data";
import { Participant, BadgeStatus } from "@/lib/types";

const statusTone: Record<BadgeStatus, { label: string; tone: "success" | "danger" | "warning" }> = {
  faol: { label: "Faol", tone: "success" },
  bloklangan: { label: "Bloklangan", tone: "danger" },
  muddati_tugagan: { label: "Muddati tugagan", tone: "warning" },
};

export default function ParticipantsPage() {
  const [query, setQuery] = useState("");
  const [accFilter, setAccFilter] = useState<string>("ALL");
  const [selected, setSelected] = useState<Participant>(participants[0]);

  const filtered = useMemo(() => {
    return participants.filter((p) => {
      const matchesQuery =
        query.trim() === "" ||
        p.fullName.toLowerCase().includes(query.toLowerCase()) ||
        p.badgeId.toLowerCase().includes(query.toLowerCase()) ||
        p.docNumber.toLowerCase().includes(query.toLowerCase());
      const matchesAcc = accFilter === "ALL" || p.accreditation === accFilter;
      return matchesQuery && matchesAcc;
    });
  }, [query, accFilter]);

  return (
    <Box>
      <Topbar title="Ishtirokchilar" subtitle={`${participants.length} ta ro'yxatga olingan shaxs`} />
      <Flex px={8} py={6} gap={6} align="start">
        <Box flex={1} minW={0}>
          <Flex justify="space-between" mb={4} gap={3} wrap="wrap">
            <HStack spacing={3} flex={1} minW="280px">
              <InputGroup maxW="320px">
                <InputLeftElement pointerEvents="none">
                  <LuSearch color="#5C6577" size={16} />
                </InputLeftElement>
                <Input
                  placeholder="F.I.Sh, badge ID yoki hujjat raqami"
                  bg="surface.800"
                  borderColor="line.900"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </InputGroup>
              <Select
                maxW="220px"
                bg="surface.800"
                borderColor="line.900"
                value={accFilter}
                onChange={(e) => setAccFilter(e.target.value)}
              >
                <option value="ALL">Barcha turlar</option>
                {accreditationTypes.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </HStack>
            <HStack>
              <Button leftIcon={<LuUpload size={15} />} variant="outline">
                Excel/CSV import
              </Button>
              <Button leftIcon={<LuPlus size={15} />}>Yangi ishtirokchi</Button>
            </HStack>
          </Flex>

          <Box
            bg="surface.800"
            border="1px solid"
            borderColor="line.900"
            borderRadius="lg"
            overflow="hidden"
          >
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
                {filtered.map((p) => {
                  const acc = accreditationByCode(p.accreditation);
                  const st = statusTone[p.badgeStatus];
                  const active = selected.id === p.id;
                  return (
                    <Tr
                      key={p.id}
                      cursor="pointer"
                      bg={active ? "surface.700" : "transparent"}
                      _hover={{ bg: "surface.700" }}
                      onClick={() => setSelected(p)}
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
                      <Td isNumeric>
                        <Button size="xs" variant="ghost" leftIcon={<LuPrinter size={13} />}>
                          Chop etish
                        </Button>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
            {filtered.length === 0 && (
              <Flex p={8} justify="center">
                <Text color="ink.500" fontSize="14px">
                  Qidiruvga mos ishtirokchi topilmadi.
                </Text>
              </Flex>
            )}
          </Box>
        </Box>

        <VStack
          w="340px"
          flexShrink={0}
          spacing={4}
          align="stretch"
          position="sticky"
          top="88px"
        >
          <Text fontSize="12px" color="ink.500" letterSpacing="0.04em">
            BADGE OLDINDAN KO&apos;RISH
          </Text>
          <BadgeCard participant={selected} />
          <Box bg="surface.800" border="1px solid" borderColor="line.900" borderRadius="lg" p={4}>
            <VStack align="stretch" spacing={2.5} fontSize="13px">
              <HStack justify="space-between">
                <Text color="ink.500">Tug&apos;ilgan sana</Text>
                <Text color="ink.900">{selected.birthDate}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="ink.500">PINFL</Text>
                <Text fontFamily="mono" color="ink.900">{selected.pinfl}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="ink.500">Telefon</Text>
                <Text color="ink.900">{selected.phone}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="ink.500">Sport turi</Text>
                <Text color="ink.900">{selected.sport ?? "—"}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="ink.500">Ro&apos;yxatga olingan</Text>
                <Text color="ink.900">{selected.createdAt}</Text>
              </HStack>
            </VStack>
          </Box>
          <Button leftIcon={<LuPrinter size={15} />} variant="outline">
            Ushbu badge PDF sifatida
          </Button>
        </VStack>
      </Flex>
    </Box>
  );
}
