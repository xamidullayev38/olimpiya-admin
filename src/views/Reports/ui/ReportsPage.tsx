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
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuFileSpreadsheet, LuFileText } from "react-icons/lu";
import Topbar from "@/widgets/Topbar/ui/Topbar";
import StatusPill from "@/shared/ui/StatusPill/StatusPill";
import { fetchAccessLogs, fetchMealLogs } from "@/shared/api/services";
import { AccessLogEntry, MealLogEntry } from "@/shared/types";
import { API_BASE_URL, ENDPOINTS } from "@/shared/api/endpoints";
import { getAccessToken } from "@/shared/api/client";

const ACC_COLORS: Record<string, { color: string; name: string }> = {
  ATH: { color: "#4C8DFF", name: "Sportchi" },
  COACH: { color: "#3FB67F", name: "Murabbiy" },
  REF: { color: "#E8A23D", name: "Hakam" },
  VOL: { color: "#9C7830", name: "Volontyor" },
  DEL: { color: "#8D96A8", name: "Delegatsiya a'zosi" },
  MEDIA: { color: "#D4A853", name: "Jurnalist" },
  VIP: { color: "#E5484D", name: "VIP mehmon" },
};

export default function ReportsPage() {
  const [accessLogs, setAccessLogs] = useState<AccessLogEntry[]>([]);
  const [mealLogs, setMealLogs] = useState<MealLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const aData = await fetchAccessLogs();
        const mData = await fetchMealLogs();
        setAccessLogs(aData);
        setMealLogs(mData);
      } catch {
        // silent catch
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const denials = accessLogs.filter((l) => l.result === "rad");

  async function handleExportExcel() {
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE_URL}${ENDPOINTS.ACCESS_LOGS.EXPORT}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "access-logs.xlsx";
        a.click();
        toast({ title: "Excel hisoboti yuklab olindi", status: "success", duration: 3000 });
      } else {
        toast({ title: "Hisobot yaratishda xatolik", status: "error", duration: 3000 });
      }
    } catch {
      toast({ title: "Backend server bilan aloqa chiqmadi", status: "warning", duration: 3000 });
    }
  }

  async function handleExportPdf() {
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE_URL}/access-logs/export/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "access-logs.pdf";
        a.click();
        toast({ title: "PDF hisoboti yuklab olindi", status: "success", duration: 3000 });
      } else {
        toast({ title: "Hisobot yaratishda xatolik", status: "error", duration: 3000 });
      }
    } catch {
      toast({ title: "Backend server bilan aloqa chiqmadi", status: "warning", duration: 3000 });
    }
  }

  return (
    <Box>
      <Topbar title="Hisobotlar" subtitle="Kirish, ovqatlanish va rad etishlar bo'yicha eksport" />
      <Box px={8} py={6}>
        <Flex justify="flex-end" mb={5} gap={3}>
          <Button leftIcon={<LuFileSpreadsheet size={15} />} variant="outline" onClick={handleExportExcel}>
            Excel eksport
          </Button>
          <Button leftIcon={<LuFileText size={15} />} variant="outline" onClick={handleExportPdf}>
            PDF eksport
          </Button>
        </Flex>

        {loading ? (
          <Flex justify="center" py={12}>
            <Spinner color="gold.400" size="lg" />
          </Flex>
        ) : (
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
                        const acc = ACC_COLORS[d.accreditation] || { color: "#2563eb", name: d.accreditation };
                        return (
                          <Tr key={d.id} _hover={{ bg: "surface.700" }}>
                            <Td fontWeight="600" color="ink.900">{d.participantName}</Td>
                            <Td>
                              <Badge bg={`${acc.color}22`} color={acc.color} px={2} py={0.5}>
                                {acc.name}
                              </Badge>
                            </Td>
                            <Td>{d.zoneCode}</Td>
                            <Td fontFamily="mono" fontSize="12px">{d.timestamp}</Td>
                            <Td fontFamily="mono" fontSize="12px" color="ink.500">{d.device}</Td>
                            <Td>
                              <Text fontSize="12px" color="signal.red" noOfLines={1} maxW="240px">
                                {d.reason || "Zona ruxsatsiz"}
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
                      {accessLogs.slice(0, 25).map((l) => {
                        return (
                          <Tr key={l.id} _hover={{ bg: "surface.700" }}>
                            <Td fontWeight="600" color="ink.900">{l.participantName}</Td>
                            <Td>{l.zoneCode}</Td>
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
        )}
      </Box>
    </Box>
  );
}
