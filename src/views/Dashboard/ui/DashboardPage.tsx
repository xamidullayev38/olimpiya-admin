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
} from "@chakra-ui/react";
import { LuUsers, LuMapPin, LuUtensils, LuBan } from "react-icons/lu";
import Topbar from "@/widgets/Topbar/ui/Topbar";
import StatCard from "@/shared/ui/StatCard/StatCard";
import StatusPill from "@/shared/ui/StatusPill/StatusPill";
import {
  liveStats,
  participants,
  accessLogs,
  mealLogs,
  accreditationByCode,
} from "@/shared/api/mock-data";

export default function DashboardPage() {
  const totalInside = liveStats.reduce((s, z) => s + z.inside, 0);
  const deniedAccess = accessLogs.filter((l) => l.result === "rad");
  const mealsServed = mealLogs.filter((l) => l.result === "ruxsat").length;
  const recentDenials = [...accessLogs, ...mealLogs.map((m) => ({
    id: m.id,
    participantName: m.participantName,
    accreditation: m.accreditation,
    zoneCode: "REST",
    direction: "IN" as const,
    timestamp: m.timestamp,
    result: m.result,
    reason: m.reason,
    device: m.point,
  }))]
    .filter((l) => l.result === "rad")
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    .slice(0, 6);

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
        <Topbar title="Boshqaruv paneli" subtitle="Real vaqtdagi holat — 14-avgust, 2026" />
        <Box px={8} py={8}>
          <HStack spacing={5} align="stretch" flexWrap="wrap" mb={8}>
            <StatCard
              label="RO'YXATDAGI ISHTIROKCHILAR"
              value={participants.length.toString()}
              hint="barcha akkreditatsiya turlari"
              icon={LuUsers}
            />
            <StatCard
              label="ZONALARDA HOZIR BOR"
              value={totalInside.toString()}
              hint={`${liveStats.length} ta zona bo'yicha`}
              icon={LuMapPin}
              accent="signal.blue"
            />
            <StatCard
              label="BUGUN BERILGAN OVQAT"
              value={mealsServed.toString()}
              hint="tushlik oynasi ochiq"
              icon={LuUtensils}
              accent="signal.green"
            />
            <StatCard
              label="RAD ETILGAN URINISHLAR"
              value={deniedAccess.length.toString()}
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
                  {liveStats.map((z) => {
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
                  {recentDenials.map((d) => {
                    const acc = accreditationByCode(d.accreditation);
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
                            <Box w="8px" h="8px" borderRadius="full" bg={acc.color} boxShadow={`0 0 8px ${acc.color}`} />
                            <Text fontSize="14px" fontWeight="600" color="ink.900">
                              {d.participantName}
                            </Text>
                          </HStack>
                          <Text fontSize="12px" color="ink.500">
                            {d.reason}
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
        </Box>
      </Box>
    </Box>
  );
}


