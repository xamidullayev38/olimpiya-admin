"use client";

import { useEffect, useState } from "react";
import {
  Flex,
  Button,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Text,
  Badge,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { LuSmartphone, LuBan } from "react-icons/lu";
import { ScannerDevice } from "@/shared/types";
import { fetchDevices, revokeDeviceApi } from "@/shared/api/services";

export function DevicesPanel() {
  const [devices, setDevices] = useState<ScannerDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  async function loadData() {
    setLoading(true);
    try {
      const dData = await fetchDevices();
      setDevices(dData);
    } catch {
      // silent catch
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleRevoke(id: string) {
    const ok = await revokeDeviceApi(id);
    if (ok) {
      toast({ title: "Qurilma kaliti bekor qilindi", status: "warning", duration: 2500 });
      loadData();
    } else {
      toast({ title: "Bekor qilishda xatolik", status: "error", duration: 2500 });
    }
  }

  return (
    <>
      <Flex justify="space-between" align="center" mb={4}>
        <Text color="ink.500" fontSize="sm">Skaner qurilmalar endi mobil ilovadan tizimga kirganda avtomatik ro'yxatga olinadi.</Text>
      </Flex>

      {loading ? (
        <Flex justify="center" py={8}>
          <Spinner color="gold.400" size="lg" />
        </Flex>
      ) : (
        <Box bg="surface.800" border="1px solid" borderColor="line.900" borderRadius="lg" overflow="hidden" className="glass-panel">
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Qurilma nomi</Th>
                <Th>Mas'ul xodim</Th>
                <Th>Biriktirilgan zona</Th>
                <Th>Holati</Th>
                <Th>Oxirgi faollik</Th>
                <Th align="right">Amallar</Th>
              </Tr>
            </Thead>
            <Tbody>
              {devices.map((d: any) => (
                <Tr key={d.id} _hover={{ bg: "surface.700" }}>
                  <Td fontWeight="600" color="ink.900">
                    <HStack spacing={2}>
                      <LuSmartphone size={15} color="#D4A853" />
                      <Text>{d.name}</Text>
                    </HStack>
                  </Td>
                  <Td>{d.assignedToUser?.fullName || d.assignedToUser?.username || "—"}</Td>
                  <Td>{d.assignedToUser?.assignedZone?.name || d.currentZone?.name || d.zoneName || "—"}</Td>
                  <Td>
                    <Badge bg={d.status === "faol" ? "signal.greenDim" : "signal.redDim"} color={d.status === "faol" ? "signal.green" : "signal.red"}>
                      {d.status === "faol" ? "FAOL" : "BEKOR QILINGAN"}
                    </Badge>
                  </Td>
                  <Td fontFamily="mono" fontSize="12px">{d.lastSeenAt || "—"}</Td>
                  <Td align="right">
                    {d.status === "faol" && (
                      <Button size="xs" colorScheme="red" variant="ghost" leftIcon={<LuBan size={13} />} onClick={() => handleRevoke(d.id)}>
                        Bekor qilish
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))}
              {devices.length === 0 && (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={6} color="ink.500">
                    Hali birorta skaner qurilma ro'yxatga olinmagan.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      )}
    </>
  );
}
