"use client";

import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Grid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { LuUtensils, LuClock, LuCircleCheck, LuCircleX } from "react-icons/lu";
import Topbar from "@/widgets/Topbar/ui/Topbar";
import StatusPill from "@/shared/ui/StatusPill/StatusPill";
import { fetchMealSchedule, fetchMealLogs } from "@/shared/api/services";
import { MealType, MealWindow, MealLogEntry } from "@/shared/types";
import { accreditationByCode } from "@/shared/api/mock-data";

export default function MealTrackingPage() {
  const [filter, setFilter] = useState<MealType | "ALL">("ALL");
  const [schedule, setSchedule] = useState<MealWindow[]>([]);
  const [logs, setLogs] = useState<MealLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const sData = await fetchMealSchedule();
        const lData = await fetchMealLogs();
        setSchedule(sData);
        setLogs(lData);
      } catch {
        // silent catch
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = useMemo(
    () => (filter === "ALL" ? logs : logs.filter((m) => m.mealType === filter)),
    [filter, logs]
  );

  const granted = logs.filter((m) => m.result === "ruxsat").length;
  const denied = logs.filter((m) => m.result === "rad").length;

  return (
    <Box>
      <Topbar title="Ovqatlanish nazorati" subtitle="Kuniga bitta ovqat turi — bir marta qoidasi" />
      <Box px={8} py={6}>
        <Text fontSize="12px" color="ink.500" letterSpacing="0.04em" mb={3}>
          BUGUNGI OVQATLANISH JADVALI
        </Text>

        {loading ? (
          <Flex justify="center" py={8}>
            <Spinner color="gold.400" size="lg" />
          </Flex>
        ) : (
          <>
            <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4} mb={7}>
              {schedule.map((m) => (
                <Box
                  key={m.mealType}
                  bg="surface.800"
                  border="1px solid"
                  borderColor="line.900"
                  borderRadius="lg"
                  p={5}
                >
                  <HStack justify="space-between" mb={3}>
                    <HStack spacing={2.5}>
                      <Flex
                        w="32px"
                        h="32px"
                        bg="canvas.900"
                        border="1px solid"
                        borderColor="line.900"
                        borderRadius="7px"
                        align="center"
                        justify="center"
                      >
                        <LuUtensils size={15} color="#D4A853" />
                      </Flex>
                      <Text fontWeight="600" fontSize="15px" color="ink.900">
                        {m.mealType}
                      </Text>
                    </HStack>
                  </HStack>
                  <HStack spacing={1.5} color="ink.500" fontSize="13px" mb={3}>
                    <LuClock size={14} />
                    <Text fontFamily="mono">{m.start}–{m.end}</Text>
                  </HStack>
                  <Text fontSize="11px" color="ink.300" mb={1.5}>
                    RUXSAT ETILGAN TURLAR
                  </Text>
                  <HStack wrap="wrap" spacing={1.5}>
                    {m.allowedAccreditations?.map((code) => {
                      const acc = accreditationByCode(code);
                      return (
                        <Badge key={code} bg={`${acc.color}22`} color={acc.color} px={2} py={0.5} fontSize="11px">
                          {acc.name}
                        </Badge>
                      );
                    })}
                  </HStack>
                </Box>
              ))}
            </Grid>

            <Flex justify="space-between" align="center" mb={4}>
              <HStack spacing={5}>
                <HStack spacing={1.5} color="signal.green">
                  <LuCircleCheck size={15} />
                  <Text fontSize="13px" fontWeight="600">{granted} ta berildi</Text>
                </HStack>
                <HStack spacing={1.5} color="signal.red">
                  <LuCircleX size={15} />
                  <Text fontSize="13px" fontWeight="600">{denied} ta rad etildi</Text>
                </HStack>
              </HStack>
              <Select
                maxW="220px"
                bg="surface.800"
                borderColor="line.900"
                value={filter}
                onChange={(e) => setFilter(e.target.value as MealType | "ALL")}
              >
                <option value="ALL">Barcha ovqat turlari</option>
                <option value="Nonushta">Nonushta</option>
                <option value="Tushlik">Tushlik</option>
                <option value="Kechki ovqat">Kechki ovqat</option>
              </Select>
            </Flex>

            <Box bg="surface.800" border="1px solid" borderColor="line.900" borderRadius="lg" overflow="hidden">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Ishtirokchi</Th>
                    <Th>Akkreditatsiya</Th>
                    <Th>Ovqat turi</Th>
                    <Th>Vaqt</Th>
                    <Th>Nuqta</Th>
                    <Th>Natija</Th>
                    <Th>Sabab</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((m) => {
                    const acc = accreditationByCode(m.accreditation);
                    return (
                      <Tr key={m.id} _hover={{ bg: "surface.700" }}>
                        <Td fontWeight="600" color="ink.900">{m.participantName}</Td>
                        <Td>
                          <Badge bg={`${acc.color}22`} color={acc.color} px={2} py={0.5}>
                            {acc.name}
                          </Badge>
                        </Td>
                        <Td>{m.mealType}</Td>
                        <Td fontFamily="mono" fontSize="12px">{m.timestamp}</Td>
                        <Td>{m.point}</Td>
                        <Td>
                          <StatusPill
                            label={m.result === "ruxsat" ? "RUXSAT" : "RAD"}
                            tone={m.result === "ruxsat" ? "success" : "danger"}
                          />
                        </Td>
                        <Td>
                          <Text fontSize="12px" color="ink.500" noOfLines={1} maxW="260px">
                            {m.reason ?? "—"}
                          </Text>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
