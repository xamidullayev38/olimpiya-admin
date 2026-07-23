"use client";

import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Badge,
} from "@chakra-ui/react";
import { LuFileSpreadsheet, LuFileText } from "react-icons/lu";
import Topbar from "@/components/Topbar";
import StatusPill from "@/components/StatusPill";
import { accessLogs, mealLogs, accreditationByCode, zoneByCode } from "@/lib/mock-data";

export default function ReportsPage() {
  const denials = accessLogs.filter((l) => l.result === "rad");

  return (
    <Box>
      <Topbar title="Hisobotlar" subtitle="Kirish, ovqatlanish va rad etishlar bo'yicha eksport" />
      <Box px={8} py={6}>
        <Flex justify="flex-end" mb={5} gap={3}>
          <Button leftIcon={<LuFileSpreadsheet size={15} />} variant="outline">
            Excel eksport
          </Button>
          <Button leftIcon={<LuFileText size={15} />} variant="outline">
            PDF eksport
          </Button>
        </Flex>

        <Tabs variant="unstyled">
          <TabList
            bg="surface.800"
            border="1px solid"
            borderColor="line.900"
            borderRadius="md"
            p={1}
            w="fit-content"
            mb={5}
          >
            {["Rad etilgan urinishlar", "Kirish tarixi", "Ovqatlanish statistikasi"].map((t) => (
              <Tab
                key={t}
                fontSize="13px"
                px={4}
                py={2}
                borderRadius="6px"
                color="ink.500"
                _selected={{ bg: "gold.400", color: "canvas.900", fontWeight: "600" }}
              >
                {t}
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <Box bg="surface.800" border="1px solid" borderColor="line.900" borderRadius="lg" overflow="hidden">
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Ishtirokchi</Th>
                      <Th>Akkreditatsiya</Th>
                      <Th>Zona</Th>
                      <Th>Vaqt</Th>
                      <Th>Qurilma</Th>
                      <Th>Sabab</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {denials.map((d) => {
                      const acc = accreditationByCode(d.accreditation);
                      const zone = zoneByCode(d.zoneCode);
                      return (
                        <Tr key={d.id} _hover={{ bg: "surface.700" }}>
                          <Td fontWeight="600" color="ink.900">{d.participantName}</Td>
                          <Td>
                            <Badge bg={`${acc.color}22`} color={acc.color} px={2} py={0.5}>
                              {acc.name}
                            </Badge>
                          </Td>
                          <Td>{zone.name}</Td>
                          <Td fontFamily="mono" fontSize="12px">{d.timestamp}</Td>
                          <Td fontFamily="mono" fontSize="12px" color="ink.500">{d.device}</Td>
                          <Td>
                            <Text fontSize="12px" color="signal.red" noOfLines={1} maxW="240px">
                              {d.reason}
                            </Text>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            <TabPanel p={0}>
              <Box bg="surface.800" border="1px solid" borderColor="line.900" borderRadius="lg" overflow="hidden">
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Ishtirokchi</Th>
                      <Th>Zona</Th>
                      <Th>Yo&apos;nalish</Th>
                      <Th>Vaqt</Th>
                      <Th>Natija</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {accessLogs.slice(0, 20).map((l) => {
                      const zone = zoneByCode(l.zoneCode);
                      return (
                        <Tr key={l.id} _hover={{ bg: "surface.700" }}>
                          <Td fontWeight="600" color="ink.900">{l.participantName}</Td>
                          <Td>{zone.name}</Td>
                          <Td>
                            <Badge
                              bg={l.direction === "IN" ? "signal.blueDim" : "surface.600"}
                              color={l.direction === "IN" ? "signal.blue" : "ink.500"}
                              px={2}
                              py={0.5}
                            >
                              {l.direction}
                            </Badge>
                          </Td>
                          <Td fontFamily="mono" fontSize="12px">{l.timestamp}</Td>
                          <Td>
                            <StatusPill
                              label={l.result === "ruxsat" ? "RUXSAT" : "RAD"}
                              tone={l.result === "ruxsat" ? "success" : "danger"}
                            />
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            <TabPanel p={0}>
              <HStack spacing={4} align="stretch" wrap="wrap">
                {(["Nonushta", "Tushlik", "Kechki ovqat"] as const).map((meal) => {
                  const entries = mealLogs.filter((m) => m.mealType === meal);
                  const granted = entries.filter((m) => m.result === "ruxsat").length;
                  const denied = entries.length - granted;
                  return (
                    <VStack
                      key={meal}
                      bg="surface.800"
                      border="1px solid"
                      borderColor="line.900"
                      borderRadius="lg"
                      p={5}
                      align="start"
                      flex={1}
                      minW="220px"
                    >
                      <Text fontWeight="600" color="ink.900">{meal}</Text>
                      <HStack fontSize="13px" spacing={4} pt={2}>
                        <VStack spacing={0} align="start">
                          <Text color="signal.green" fontFamily="mono" fontWeight="700" fontSize="20px">
                            {granted}
                          </Text>
                          <Text color="ink.500" fontSize="11px">berildi</Text>
                        </VStack>
                        <VStack spacing={0} align="start">
                          <Text color="signal.red" fontFamily="mono" fontWeight="700" fontSize="20px">
                            {denied}
                          </Text>
                          <Text color="ink.500" fontSize="11px">rad etildi</Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  );
                })}
              </HStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
}
