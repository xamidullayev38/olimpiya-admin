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
  Checkbox,
  IconButton
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuFileSpreadsheet, LuFileText, LuTrash2, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import Topbar from "@/widgets/Topbar/ui/Topbar";
import StatusPill from "@/shared/ui/StatusPill/StatusPill";
import { fetchAccessLogsPaginated, fetchMealLogs, deleteAccessLogsApi } from "@/shared/api/services";
import { AccessLogEntry, MealLogEntry } from "@/shared/types";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { apiClient } from "@/shared/api/client";

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
  const [activeTab, setActiveTab] = useState(0);

  // States for Denied
  const [deniedLogs, setDeniedLogs] = useState<AccessLogEntry[]>([]);
  const [deniedLoading, setDeniedLoading] = useState(false);
  const [deniedPage, setDeniedPage] = useState(1);
  const [deniedTotal, setDeniedTotal] = useState(0);
  const [deniedSelected, setDeniedSelected] = useState<string[]>([]);

  // States for Access
  const [accessLogs, setAccessLogs] = useState<AccessLogEntry[]>([]);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessPage, setAccessPage] = useState(1);
  const [accessTotal, setAccessTotal] = useState(0);
  const [accessSelected, setAccessSelected] = useState<string[]>([]);

  // States for Meal
  const [mealLogs, setMealLogs] = useState<MealLogEntry[]>([]);
  const [mealLoading, setMealLoading] = useState(false);

  const toast = useToast();
  const PAGE_SIZE = 25;

  const loadDenied = async () => {
    setDeniedLoading(true);
    try {
      const { items, total } = await fetchAccessLogsPaginated({ result: "DENIED", page: deniedPage, pageSize: PAGE_SIZE });
      setDeniedLogs(items);
      setDeniedTotal(total);
    } catch {
      // ignore
    } finally {
      setDeniedLoading(false);
    }
  };

  const loadAccess = async () => {
    setAccessLoading(true);
    try {
      const { items, total } = await fetchAccessLogsPaginated({ page: accessPage, pageSize: PAGE_SIZE });
      setAccessLogs(items);
      setAccessTotal(total);
    } catch {
      // ignore
    } finally {
      setAccessLoading(false);
    }
  };

  const loadMeal = async () => {
    setMealLoading(true);
    try {
      const mData = await fetchMealLogs(); // Fetch all for stats
      setMealLogs(mData);
    } catch {
      // ignore
    } finally {
      setMealLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 0) loadDenied();
    else if (activeTab === 1) loadAccess();
    else if (activeTab === 2) loadMeal();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, deniedPage, accessPage]);

  async function handleExportExcel() {
    try {
      const blob = await apiClient<Blob>(ENDPOINTS.ACCESS_LOGS.EXPORT);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "access-logs.xlsx";
      a.click();
      toast({ title: "Excel hisoboti yuklab olindi", status: "success", duration: 3000 });
    } catch {
      toast({ title: "Hisobot yaratishda xatolik yuz berdi", status: "error", duration: 3000 });
    }
  }

  async function handleExportPdf() {
    try {
      const blob = await apiClient<Blob>("/access-logs/export/pdf");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "access-logs.pdf";
      a.click();
      toast({ title: "PDF hisoboti yuklab olindi", status: "success", duration: 3000 });
    } catch {
      toast({ title: "Hisobot yaratishda xatolik yuz berdi", status: "error", duration: 3000 });
    }
  }

  const handleDelete = async () => {
    const selected = activeTab === 0 ? deniedSelected : accessSelected;
    if (!selected.length) return;
    
    try {
      await deleteAccessLogsApi(selected);
      toast({ title: "Muvaffaqiyatli o'chirildi", status: "success", duration: 3000 });
      if (activeTab === 0) {
        setDeniedSelected([]);
        loadDenied();
      } else {
        setAccessSelected([]);
        loadAccess();
      }
    } catch {
      toast({ title: "O'chirishda xatolik", status: "error", duration: 3000 });
    }
  };

  const toggleDenied = (id: string) => {
    setDeniedSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };
  const toggleAllDenied = () => {
    if (deniedSelected.length === deniedLogs.length && deniedLogs.length > 0) setDeniedSelected([]);
    else setDeniedSelected(deniedLogs.map((l) => l.id));
  };

  const toggleAccess = (id: string) => {
    setAccessSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };
  const toggleAllAccess = () => {
    if (accessSelected.length === accessLogs.length && accessLogs.length > 0) setAccessSelected([]);
    else setAccessSelected(accessLogs.map((l) => l.id));
  };

  const mealStats = (["Nonushta", "Tushlik", "Kechki ovqat"] as const).map((meal) => {
    const entries = mealLogs.filter((m) => m.mealType === meal);
    const granted = entries.filter((m) => m.result === "ruxsat").length;
    const denied = entries.length - granted;
    return { name: meal, Ruxsat: granted, Rad: denied };
  });

  const selectedCount = activeTab === 0 ? deniedSelected.length : activeTab === 1 ? accessSelected.length : 0;

  return (
    <Box>
      <Topbar title="Hisobotlar" subtitle="Kirish, ovqatlanish va rad etishlar bo'yicha eksport" />
      <Box px={8} py={6}>
        <Flex justify="space-between" mb={5}>
          <Box>
            {selectedCount > 0 && activeTab !== 2 && (
              <Button leftIcon={<LuTrash2 size={16} />} colorScheme="red" onClick={handleDelete}>
                Belgilanganlarni o'chirish ({selectedCount})
              </Button>
            )}
          </Box>
          <Flex gap={3}>
            <Button leftIcon={<LuFileSpreadsheet size={15} />} variant="outline" onClick={handleExportExcel}>
              Excel eksport
            </Button>
            <Button leftIcon={<LuFileText size={15} />} variant="outline" onClick={handleExportPdf}>
              PDF eksport
            </Button>
          </Flex>
        </Flex>

        <Tabs isLazy variant="unstyled" index={activeTab} onChange={(index) => setActiveTab(index)}>
          <TabList
            bg="surface.800"
            border="1px solid"
            borderColor="line.900"
            borderRadius="md"
            p={1}
            w="fit-content"
            mb={5}
          >
            {["Rad etilgan urinishlar", "Kirish tarixi", "Ovqatlanish statistikasi"].map((t, idx) => (
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
                {deniedLoading ? (
                  <Flex justify="center" py={12}><Spinner color="gold.400" /></Flex>
                ) : (
                  <>
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th w="40px">
                            <Checkbox 
                              isChecked={deniedSelected.length > 0 && deniedSelected.length === deniedLogs.length}
                              isIndeterminate={deniedSelected.length > 0 && deniedSelected.length < deniedLogs.length}
                              onChange={toggleAllDenied}
                            />
                          </Th>
                          <Th>Ishtirokchi</Th>
                          <Th>Akkreditatsiya</Th>
                          <Th>Zona</Th>
                          <Th>Vaqt</Th>
                          <Th>Qurilma</Th>
                          <Th>Sabab</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {deniedLogs.map((d) => {
                          const acc = ACC_COLORS[d.accreditation] || { color: "#2563eb", name: d.accreditation };
                          return (
                            <Tr key={d.id} _hover={{ bg: "surface.700" }}>
                              <Td>
                                <Checkbox isChecked={deniedSelected.includes(d.id)} onChange={() => toggleDenied(d.id)} />
                              </Td>
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
                        {deniedLogs.length === 0 && (
                          <Tr>
                            <Td colSpan={7} textAlign="center" py={8} color="ink.500">Ma'lumot topilmadi</Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                    {deniedTotal > PAGE_SIZE && (
                      <Flex justify="space-between" align="center" p={3} borderTop="1px solid" borderColor="line.900">
                        <Text fontSize="12px" color="ink.500">Jami: {deniedTotal} ta</Text>
                        <HStack>
                          <IconButton aria-label="prev" icon={<LuChevronLeft />} size="sm" isDisabled={deniedPage === 1} onClick={() => setDeniedPage(deniedPage - 1)} />
                          <Text fontSize="12px" color="ink.900">{deniedPage} / {Math.ceil(deniedTotal / PAGE_SIZE)}</Text>
                          <IconButton aria-label="next" icon={<LuChevronRight />} size="sm" isDisabled={deniedPage >= Math.ceil(deniedTotal / PAGE_SIZE)} onClick={() => setDeniedPage(deniedPage + 1)} />
                        </HStack>
                      </Flex>
                    )}
                  </>
                )}
              </Box>
            </TabPanel>

            <TabPanel p={0}>
              <Box bg="surface.800" border="1px solid" borderColor="line.900" borderRadius="lg" overflow="hidden">
                {accessLoading ? (
                  <Flex justify="center" py={12}><Spinner color="gold.400" /></Flex>
                ) : (
                  <>
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th w="40px">
                            <Checkbox 
                              isChecked={accessSelected.length > 0 && accessSelected.length === accessLogs.length}
                              isIndeterminate={accessSelected.length > 0 && accessSelected.length < accessLogs.length}
                              onChange={toggleAllAccess}
                            />
                          </Th>
                          <Th>Ishtirokchi</Th>
                          <Th>Zona</Th>
                          <Th>Yo&apos;nalish</Th>
                          <Th>Vaqt</Th>
                          <Th>Qurilma</Th>
                          <Th>Natija</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {accessLogs.map((l) => {
                          return (
                            <Tr key={l.id} _hover={{ bg: "surface.700" }}>
                              <Td>
                                <Checkbox isChecked={accessSelected.includes(l.id)} onChange={() => toggleAccess(l.id)} />
                              </Td>
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
                              <Td fontFamily="mono" fontSize="12px" color="ink.500">{l.device}</Td>
                              <Td>
                                <StatusPill
                                  label={l.result === "ruxsat" ? "RUXSAT" : "RAD"}
                                  tone={l.result === "ruxsat" ? "success" : "danger"}
                                />
                              </Td>
                            </Tr>
                          );
                        })}
                        {accessLogs.length === 0 && (
                          <Tr>
                            <Td colSpan={7} textAlign="center" py={8} color="ink.500">Ma'lumot topilmadi</Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                    {accessTotal > PAGE_SIZE && (
                      <Flex justify="space-between" align="center" p={3} borderTop="1px solid" borderColor="line.900">
                        <Text fontSize="12px" color="ink.500">Jami: {accessTotal} ta</Text>
                        <HStack>
                          <IconButton aria-label="prev" icon={<LuChevronLeft />} size="sm" isDisabled={accessPage === 1} onClick={() => setAccessPage(accessPage - 1)} />
                          <Text fontSize="12px" color="ink.900">{accessPage} / {Math.ceil(accessTotal / PAGE_SIZE)}</Text>
                          <IconButton aria-label="next" icon={<LuChevronRight />} size="sm" isDisabled={accessPage >= Math.ceil(accessTotal / PAGE_SIZE)} onClick={() => setAccessPage(accessPage + 1)} />
                        </HStack>
                      </Flex>
                    )}
                  </>
                )}
              </Box>
            </TabPanel>

            <TabPanel p={0}>
              <Box bg="surface.800" border="1px solid" borderColor="line.900" borderRadius="lg" p={5}>
                {mealLoading ? (
                  <Flex justify="center" py={12}><Spinner color="gold.400" /></Flex>
                ) : (
                  <Box w="100%" h="350px">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mealStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2D3035" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: "#8D96A8", fontSize: 13 }} axisLine={{ stroke: "#2D3035" }} tickLine={false} />
                        <YAxis tick={{ fill: "#8D96A8", fontSize: 13 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#17181A", borderColor: "#2D3035", borderRadius: "8px" }}
                          itemStyle={{ fontSize: "14px", fontWeight: "600" }}
                          labelStyle={{ color: "#8D96A8", marginBottom: "5px" }}
                          cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                        />
                        <Legend wrapperStyle={{ paddingTop: "15px", fontSize: "14px" }} />
                        <Bar dataKey="Ruxsat" fill="#3FB67F" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        <Bar dataKey="Rad" fill="#E5484D" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
}
