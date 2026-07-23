"use client";

import {
  Box,
  Grid,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  Progress,
  Button,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { LuMapPin, LuScanLine, LuPlus } from "react-icons/lu";
import Topbar from "@/components/Topbar";
import { zones, accreditationTypes } from "@/lib/mock-data";

export default function ZonesPage() {
  return (
    <Box>
      <Topbar title="Zonalar" subtitle={`${zones.length} ta bino/zona ro'yxatga olingan`} />
      <Box px={8} py={6}>
        <Flex justify="flex-end" mb={4}>
          <Button leftIcon={<LuPlus size={15} />}>Yangi zona</Button>
        </Flex>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap={5}>
          {zones.map((z) => {
            const pct = z.capacity ? Math.round((z.currentInside / z.capacity) * 100) : null;
            const allowedFor = accreditationTypes.filter((a) => a.allowedZoneCodes.includes(z.code));
            return (
              <Box
                key={z.code}
                bg="surface.800"
                border="1px solid"
                borderColor="line.900"
                borderRadius="lg"
                p={5}
              >
                <Flex justify="space-between" align="start" mb={3}>
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
                      <LuMapPin size={15} color="#D4A853" />
                    </Flex>
                    <VStack spacing={0} align="start">
                      <Text fontWeight="600" fontSize="14px" color="ink.900">
                        {z.name}
                      </Text>
                      <Text fontFamily="mono" fontSize="11px" color="ink.300">
                        {z.code}
                      </Text>
                    </VStack>
                  </HStack>
                  <Badge
                    bg={z.kind === "kirish_chiqish" ? "signal.blueDim" : "surface.600"}
                    color={z.kind === "kirish_chiqish" ? "signal.blue" : "ink.500"}
                    px={2}
                    py={0.5}
                  >
                    {z.kind === "kirish_chiqish" ? "IN / OUT" : "Ochiq"}
                  </Badge>
                </Flex>

                <VStack align="stretch" spacing={2} mb={4}>
                  <Flex justify="space-between" fontSize="12px" color="ink.500">
                    <Text>Hozir ichkarida</Text>
                    <Text fontFamily="mono" color="ink.900" fontWeight="600">
                      {z.currentInside}{z.capacity ? ` / ${z.capacity}` : ""}
                    </Text>
                  </Flex>
                  {pct !== null && (
                    <Progress
                      value={pct}
                      size="xs"
                      borderRadius="full"
                      bg="canvas.900"
                      sx={{
                        "& > div": {
                          background: pct > 85 ? "#E5484D" : pct > 60 ? "#E8A23D" : "#3FB67F",
                        },
                      }}
                    />
                  )}
                </VStack>

                <HStack fontSize="12px" color="ink.500" mb={3} spacing={4}>
                  <HStack spacing={1.5}>
                    <LuScanLine size={13} />
                    <Text>{z.scanPoints} ta skaner nuqta</Text>
                  </HStack>
                </HStack>

                <Text fontSize="11px" color="ink.300" mb={1.5} letterSpacing="0.03em">
                  RUXSAT ETILGAN TURLAR
                </Text>
                <Wrap spacing={1.5}>
                  {allowedFor.map((a) => (
                    <WrapItem key={a.code}>
                      <Badge bg={`${a.color}22`} color={a.color} px={2} py={0.5} fontSize="11px">
                        {a.name}
                      </Badge>
                    </WrapItem>
                  ))}
                  {allowedFor.length === 0 && (
                    <Text fontSize="12px" color="ink.300">
                      Hech kim ruxsat etilmagan
                    </Text>
                  )}
                </Wrap>
              </Box>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
}
