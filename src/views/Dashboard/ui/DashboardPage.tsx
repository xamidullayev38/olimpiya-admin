"use client";

import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Grid,
  GridItem,
  Progress,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuUsers, LuMapPin, LuUtensils, LuBan } from "react-icons/lu";
import Topbar from "@/widgets/Topbar/ui/Topbar";
import StatCard from "@/shared/ui/StatCard/StatCard";
import StatusPill from "@/shared/ui/StatusPill/StatusPill";
import { LiveStat, AccessLogEntry } from "@/shared/types";
import { fetchLiveStats, fetchDeniedAccessLogs } from "@/shared/api/services";
import { io } from "socket.io-client";
import { API_BASE_URL } from "@/shared/api/endpoints";
import { getAccessToken } from "@/shared/api/client";

const ACC_COLORS: Record<string, string> = {
  ATH: "#4C8DFF",
  COACH: "#3FB67F",
  REF: "#E8A23D",
  VOL: "#9C7830",
  DEL: "#8D96A8",
  MEDIA: "#D4A853",
  VIP: "#E5484D",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<LiveStat[]>([]);
  const [totals, setTotals] = useState({
    participants: 0,
    scansToday: 0,
    deniedToday: 0,
    mealsToday: 0,
  });
  const [denials, setDenials] = useState<AccessLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { liveStats, totals } = await fetchLiveStats();
        const deniedLogs = await fetchDeniedAccessLogs();
        setStats(liveStats);
        setTotals(totals);
        setDenials(deniedLogs.slice(0, 6));
      } catch {
        // silent catch
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // WebSocket real-time ulanishi
    const token = getAccessToken();
    const wsUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
    const socket = io(`${wsUrl}/dashboard`, {
      auth: { token },
      query: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("stats", (data: any) => {
      if (data) {
        const liveStats: LiveStat[] = (data.zoneOccupancy || []).map((z: any) => ({
          zoneCode: z.zoneCode || z.code || "ZONE",
          zoneName: z.zoneName || z.name || "Zona",
          inside: z.currentOccupancy ?? 0,
          inToday: z.inCount ?? z.currentOccupancy ?? 0,
          outToday: z.outCount ?? 0,
        }));
        setStats(liveStats);
        setTotals({
          participants: data.totalParticipants || 0,
          scansToday: data.totalScansToday || 0,
          deniedToday: data.deniedToday || 0,
          mealsToday: data.mealsServedToday || 0,
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const totalInside = stats.reduce((s, z) => s + z.inside, 0);

  return (
    <Box position="relative" minH="100vh" overflow="hidden">
      {/* Dynamic Background */}
      <Box
        position="absolute"
        top="-20%"
        left="-10%"
        w="70%"
        h="70%"
        bg="radial-gradient(circle, rgba(76, 141, 255, 0.08) 0%, rgba(0,0,0,0) 70%)"
        filter="blur(60px)"
        zIndex={0}
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-20%"
        right="-10%"
        w="60%"
        h="60%"
        bg="radial-gradient(circle, rgba(212, 168, 83, 0.06) 0%, rgba(0,0,0,0) 70%)"
        filter="blur(60px)"
        zIndex={0}
        pointerEvents="none"
      />

      <Box position="relative" zIndex={1}>
        <Topbar title="Boshqaruv paneli" subtitle="Real vaqtdagi holat va statistika" />
        <Box px={8} py={8}>
          {loading ? (
            <Flex justify="center" py={12}>
              <Spinner color="gold.400" size="lg" />
            </Flex>
          ) : (
            <>
              <HStack spacing={5} align="stretch" flexWrap="wrap" mb={8}>
                <StatCard
                  label="RO'YXATDAGI ISHTIROKCHILAR"
                  value={totals.participants.toString()}
                  hint="barcha akkreditatsiya turlari"
                  icon={LuUsers}
                />
                <StatCard
                  label="ZONALARDA HOZIR BOR"
                  value={totalInside.toString()}
                  hint={`${stats.length} ta zona bo'yicha`}
                  icon={LuMapPin}
                  accent="signal.blue"
                />
                <StatCard
                  label="BUGUN BERILGAN OVQAT"
                  value={totals.mealsToday.toString()}
                  hint="oshxona nazorati"
                  icon={LuUtensils}
                  accent="signal.green"
                />
                <StatCard
                  label="RAD ETILGAN URINISHLAR"
                  value={totals.deniedToday.toString()}
                  hint="oxirgi 24 soatda"
                  icon={LuBan}
                  accent="signal.red"
                />
              </HStack>

              <Grid templateColumns={{ base: "1fr", xl: "1.4fr 1fr" }} gap={6}>
                <GridItem>
                  <Box
                    className="glass-panel"
                    p={6}
                    style={{
                      background: 'rgba(27, 32, 40, 0.3)',
                      backdropFilter: 'blur(24px)',
                    }}
                  >
                    <Flex justify="space-between" align="center" mb={6}>
                      <Text fontFamily="heading" fontWeight="600" fontSize="18px" color="ink.900">
                        Zonalar bo'yicha joriy to'lish
                      </Text>
                      <Box w="8px" h="8px" borderRadius="full" bg="signal.green" boxShadow="0 0 12px #3FB67F" />
                    </Flex>
                    <VStack align="stretch" spacing={5}>
                      {stats.map((z) => {
                        const pct = z.capacity ? Math.round((z.inside / z.capacity) * 100) : null;
                        return (
                          <Box key={z.zoneCode} p={3} borderRadius="lg" bg="rgba(255, 255, 255, 0.02)" border="1px solid" borderColor="line.900" transition="all 0.2s" _hover={{ bg: "rgba(255,255,255, 0.04)" }}>
                            <Flex justify="space-between" mb={2}>
                              <HStack spacing={3}>
                                <Flex w="32px" h="32px" borderRadius="md" bg="surface.700" align="center" justify="center" border="1px solid" borderColor="line.800">
                                  <LuMapPin size={14} color="#D4A853" />
                                </Flex>
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="14px" fontWeight="600" color="ink.900">
                                    {z.zoneName}
                                  </Text>
                                  <Text fontFamily="mono" fontSize="11px" color="ink.500">
                                    {z.zoneCode}
                                  </Text>
                                </VStack>
                              </HStack>
                              <HStack spacing={4} fontSize="13px" color="ink.500">
                                <Text>Kirish: <Text as="span" color="ink.900" fontWeight="500">{z.inToday}</Text></Text>
                                <Text>Chiqish: <Text as="span" color="ink.900" fontWeight="500">{z.outToday}</Text></Text>
                                <Badge bg="surface.900" color="ink.900" border="1px solid" borderColor="line.800" px={2} py={0.5} borderRadius="md" fontFamily="mono">
                                  {z.inside} {z.capacity ? `/ ${z.capacity}` : ""}
                                </Badge>
                              </HStack>
                            </Flex>
                            {pct !== null && (
                              <Progress
                                value={pct}
                                size="xs"
                                borderRadius="full"
                                bg="surface.900"
                                border="1px solid"
                                borderColor="line.900"
                                sx={{
                                  "& > div": {
                                    background:
                                      pct > 85 ? "linear-gradient(90deg, #E5484D80, #E5484D)" : pct > 60 ? "linear-gradient(90deg, #E8A23D80, #E8A23D)" : "linear-gradient(90deg, #3FB67F80, #3FB67F)",
                                    boxShadow: pct > 85 ? "0 0 10px #E5484D40" : "0 0 10px #3FB67F40",
                                  },
                                }}
                              />
                            )}
                          </Box>
                        );
                      })}
                    </VStack>
                  </Box>
                </GridItem>

                <GridItem>
                  <Box
                    className="glass-panel"
                    p={6}
                    style={{
                      background: 'rgba(27, 32, 40, 0.3)',
                      backdropFilter: 'blur(24px)',
                    }}
                    h="100%"
                  >
                    <Text fontFamily="heading" fontWeight="600" fontSize="18px" color="ink.900" mb={1}>
                      Rad etilgan so'nggi urinishlar
                    </Text>
                    <Text fontSize="13px" color="ink.500" mb={6}>
                      Shubhali holatlarni tezkor aniqlash
                    </Text>
                    <VStack align="stretch" spacing={4}>
                      {denials.map((d) => {
                        const color = ACC_COLORS[d.accreditation] || "#2563eb";
                        return (
                          <Flex
                            key={d.id}
                            justify="space-between"
                            align="start"
                            p={3}
                            borderRadius="lg"
                            bg="rgba(229, 72, 77, 0.03)"
                            border="1px solid"
                            borderColor="rgba(229, 72, 77, 0.1)"
                            transition="all 0.2s"
                            _hover={{ bg: "rgba(229, 72, 77, 0.06)" }}
                          >
                            <VStack align="start" spacing={1.5}>
                              <HStack spacing={2}>
                                <Box w="8px" h="8px" borderRadius="full" bg={color} boxShadow={`0 0 8px ${color}`} />
                                <Text fontSize="14px" fontWeight="600" color="ink.900">
                                  {d.participantName}
                                </Text>
                              </HStack>
                              <Text fontSize="12px" color="ink.500">
                                {d.reason || "Zona uchun ruxsat yo'q"}
                              </Text>
                              <Text fontFamily="mono" fontSize="11px" color="signal.red" opacity={0.8}>
                                {d.timestamp}
                              </Text>
                            </VStack>
                            <StatusPill label="RAD" tone="danger" />
                          </Flex>
                        );
                      })}
                    </VStack>
                  </Box>
                </GridItem>
              </Grid>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
