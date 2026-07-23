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
} from "@chakra-ui/react";
import { LuUsers, LuMapPin, LuUtensils, LuBan } from "react-icons/lu";
import Topbar from "@/components/Topbar";
import StatCard from "@/components/StatCard";
import StatusPill from "@/components/StatusPill";
import {
  liveStats,
  participants,
  accessLogs,
  mealLogs,
  accreditationByCode,
} from "@/lib/mock-data";

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
    <Box>
      <Topbar title="Boshqaruv paneli" subtitle="Real vaqtdagi holat — 14-avgust, 2026" />
      <Box px={8} py={6}>
        <HStack spacing={4} align="stretch" flexWrap="wrap" mb={6}>
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
              bg="surface.800"
              border="1px solid"
              borderColor="line.900"
              borderRadius="lg"
              p={5}
            >
              <Text fontFamily="heading" fontWeight="600" fontSize="16px" color="ink.900" mb={4}>
                Zonalar bo&apos;yicha joriy to&apos;lish
              </Text>
              <VStack align="stretch" spacing={4}>
                {liveStats.map((z) => {
                  const pct = z.capacity ? Math.round((z.inside / z.capacity) * 100) : null;
                  return (
                    <Box key={z.zoneCode}>
                      <Flex justify="space-between" mb={1.5}>
                        <HStack spacing={2}>
                          <Text fontSize="13px" fontWeight="600" color="ink.900">
                            {z.zoneName}
                          </Text>
                          <Text fontFamily="mono" fontSize="11px" color="ink.300">
                            {z.zoneCode}
                          </Text>
                        </HStack>
                        <HStack spacing={3} fontSize="12px" color="ink.500">
                          <Text>Kirish {z.inToday}</Text>
                          <Text>Chiqish {z.outToday}</Text>
                          <Text fontFamily="mono" color="ink.900" fontWeight="600">
                            {z.inside}
                            {z.capacity ? ` / ${z.capacity}` : ""}
                          </Text>
                        </HStack>
                      </Flex>
                      {pct !== null && (
                        <Progress
                          value={pct}
                          size="xs"
                          borderRadius="full"
                          bg="canvas.900"
                          sx={{
                            "& > div": {
                              background:
                                pct > 85 ? "#E5484D" : pct > 60 ? "#E8A23D" : "#3FB67F",
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
              bg="surface.800"
              border="1px solid"
              borderColor="line.900"
              borderRadius="lg"
              p={5}
            >
              <Text fontFamily="heading" fontWeight="600" fontSize="16px" color="ink.900" mb={1}>
                Rad etilgan so&apos;nggi urinishlar
              </Text>
              <Text fontSize="12px" color="ink.500" mb={4}>
                Shubhali holatlarni tezkor aniqlash uchun
              </Text>
              <VStack align="stretch" spacing={3}>
                {recentDenials.map((d) => {
                  const acc = accreditationByCode(d.accreditation);
                  return (
                    <Flex
                      key={d.id}
                      justify="space-between"
                      align="start"
                      pb={3}
                      borderBottom="1px solid"
                      borderColor="line.900"
                      _last={{ borderBottom: "none", pb: 0 }}
                    >
                      <VStack align="start" spacing={0.5}>
                        <HStack spacing={2}>
                          <Box w="6px" h="6px" borderRadius="full" bg={acc.color} />
                          <Text fontSize="13px" fontWeight="600" color="ink.900">
                            {d.participantName}
                          </Text>
                        </HStack>
                        <Text fontSize="12px" color="ink.500">
                          {d.reason}
                        </Text>
                        <Text fontFamily="mono" fontSize="11px" color="ink.300">
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
  );
}
