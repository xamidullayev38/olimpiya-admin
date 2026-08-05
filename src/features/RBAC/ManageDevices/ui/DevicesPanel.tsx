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
  VStack,
  Text,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  Spinner,
  useToast,
  Code,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { LuPlus, LuSmartphone, LuBan } from "react-icons/lu";
import { ScannerDevice, Zone } from "@/shared/types";
import { fetchDevices, createDeviceApi, revokeDeviceApi, fetchZones } from "@/shared/api/services";

export function DevicesPanel() {
  const [devices, setDevices] = useState<ScannerDevice[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [name, setName] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [createdDevice, setCreatedDevice] = useState<{ id: string; key: string } | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const dData = await fetchDevices();
      const zData = await fetchZones();
      setDevices(dData);
      setZones(zData);
    } catch {
      // silent catch
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate() {
    if (!name.trim()) {
      toast({ title: "Qurilma nomi kiritilishi shart", status: "warning", duration: 2500 });
      return;
    }
    try {
      const created = await createDeviceApi({
        name: name.trim(),
        zoneId: zoneId || undefined,
      });
      setCreatedDevice({ id: created.id, key: created.deviceKey || "—" });
      toast({ title: "Qurilma muvaffaqiyatli ro'yxatga olindi", status: "success", duration: 3000 });
      loadData();
    } catch (err: any) {
      toast({ title: "Qurilma yaratishda xatolik", description: err.message, status: "error", duration: 3000 });
    }
  }

  async function handleRevoke(id: string) {
    const ok = await revokeDeviceApi(id);
    if (ok) {
      toast({ title: "Qurilma kaliti bekor qilindi", status: "warning", duration: 2500 });
      loadData();
    } else {
      toast({ title: "Bekor qilishda xatolik", status: "error", duration: 2500 });
    }
  }

  function handleCloseModal() {
    setName("");
    setZoneId("");
    setCreatedDevice(null);
    onClose();
  }

  return (
    <>
      <Flex justify="flex-end" mb={4}>
        <Button leftIcon={<LuPlus size={15} />} onClick={onOpen}>
          Yangi skaner qurilma ulash
        </Button>
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
                <Th>Biriktirilgan zona</Th>
                <Th>Holati</Th>
                <Th>Oxirgi faollik</Th>
                <Th align="right">Amallar</Th>
              </Tr>
            </Thead>
            <Tbody>
              {devices.map((d) => (
                <Tr key={d.id} _hover={{ bg: "surface.700" }}>
                  <Td fontWeight="600" color="ink.900">
                    <HStack spacing={2}>
                      <LuSmartphone size={15} color="#D4A853" />
                      <Text>{d.name}</Text>
                    </HStack>
                  </Td>
                  <Td>{d.zoneName || "—"}</Td>
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
                  <Td colSpan={5} textAlign="center" py={6} color="ink.500">
                    Hali birorta skaner qurilma ulangan emas.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={handleCloseModal} size="md">
        <ModalOverlay />
        <ModalContent className="glass-panel">
          <ModalHeader color="ink.900">Skaner qurilmani ro'yxatga olish</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {createdDevice ? (
              <VStack align="stretch" spacing={3}>
                <Alert status="success" borderRadius="md" bg="rgba(63, 182, 127, 0.1)" color="signal.green">
                  <AlertIcon />
                  Qurilma yaratildi! Ushbu ma'lumotlarni mobil skaner ilovasiga kiriting.
                </Alert>
                <Text fontSize="13px" color="ink.500">Qurilma ID (Device ID):</Text>
                <Code p={3} borderRadius="md" colorScheme="blue" fontSize="14px" textAlign="center" wordBreak="break-all">
                  {createdDevice.id}
                </Code>
                <Text fontSize="13px" color="ink.500">Qurilma maxfiy kaliti (Device Key):</Text>
                <Code p={3} borderRadius="md" colorScheme="yellow" fontSize="14px" textAlign="center" wordBreak="break-all">
                  {createdDevice.key}
                </Code>
                <Text fontSize="11px" color="ink.300">⚠️ Ogohlantirish: Ushbu ma'lumotlar qayta ko'rsatilmadi, ularni nusxalab oling.</Text>
              </VStack>
            ) : (
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontSize="13px" color="ink.500">Qurilma nomi (masalan: Skaner №1)</FormLabel>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Skaner №1 — Asosiy kirish" />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="13px" color="ink.500">Biriktiriladigan zona</FormLabel>
                  <Select value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
                    <option value="">Zona biriktirilmagan</option>
                    {zones.map((z) => (
                      <option key={z.id || z.code} value={z.id}>
                        {z.name} ({z.code})
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            {createdKey ? (
              <Button onClick={handleCloseModal}>Yopish</Button>
            ) : (
              <>
                <Button variant="ghost" mr={3} onClick={handleCloseModal}>Bekor qilish</Button>
                <Button onClick={handleCreate}>Ro'yxatdan o'tkazish</Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
