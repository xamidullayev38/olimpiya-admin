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
  useToast,
  Spinner,
  IconButton,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuMapPin, LuScanLine, LuPlus, LuTrash, LuEdit } from "react-icons/lu";
import Topbar from "@/widgets/Topbar/ui/Topbar";
import { fetchZones, fetchAccreditationTypes, createZoneApi, deleteZoneApi, updateZoneApi } from "@/shared/api/services";
import { Zone, ZoneKind, AccreditationType } from "@/shared/types";
import { DeviceManagerModal } from "./DeviceManagerModal";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [accTypes, setAccTypes] = useState<AccreditationType[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeviceModalOpen, onOpen: onDeviceModalOpen, onClose: onDeviceModalClose } = useDisclosure();
  const [selectedZoneForDevices, setSelectedZoneForDevices] = useState<Zone | null>(null);
  const toast = useToast();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [kind, setKind] = useState<ZoneKind>("kirish_chiqish");
  const [scanPoints, setScanPoints] = useState("1");
  const [capacity, setCapacity] = useState("");
  const [selectedAccTypes, setSelectedAccTypes] = useState<string[]>([]);
  
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [editingZone, setEditingZone] = useState<Zone | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const zData = await fetchZones();
      const aData = await fetchAccreditationTypes();
      setZones(zData);
      setAccTypes(aData);
    } catch {
      // silent catch
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setName("");
    setCode("");
    setKind("kirish_chiqish");
    setScanPoints("1");
    setCapacity("");
    setSelectedAccTypes([]);
    setEditingZone(null);
  }

  async function createZone() {
    if (name.trim() === "" || code.trim() === "") {
      toast({ title: "Nomi va kodi kiritilishi shart", status: "warning", duration: 2500 });
      return;
    }
    if (zones.some((z) => z.code.toUpperCase() === code.trim().toUpperCase())) {
      toast({ title: "Bu kod bilan zona allaqachon mavjud", status: "error", duration: 2500 });
      return;
    }
    try {
      const zone = await createZoneApi({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        requiresAccessControl: kind === "kirish_chiqish",
        description: capacity ? `Sig'imi: ${capacity}` : undefined,
        allowedAccreditationTypeIds: selectedAccTypes,
      });

      await loadData();
      resetForm();
      onClose();
      toast({
        title: "Yangi zona qo'shildi",
        description: `${zone.name} (${zone.code})`,
        status: "success",
        duration: 3000,
      });
    } catch (err: any) {
      toast({ title: "Zona yaratishda xatolik", description: err.message, status: "error", duration: 3000 });
    }
  }

  async function updateZone() {
    if (!editingZone) return;
    if (name.trim() === "" || code.trim() === "") {
      toast({ title: "Nomi va kodi kiritilishi shart", status: "warning", duration: 2500 });
      return;
    }
    if (zones.some((z) => z.id !== editingZone.id && z.code.toUpperCase() === code.trim().toUpperCase())) {
      toast({ title: "Bu kod bilan boshqa zona allaqachon mavjud", status: "error", duration: 2500 });
      return;
    }
    try {
      await updateZoneApi(editingZone.id as string, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        requiresAccessControl: kind === "kirish_chiqish",
        description: capacity ? `Sig'imi: ${capacity}` : undefined,
        allowedAccreditationTypeIds: selectedAccTypes,
      });

      await loadData();
      onEditClose();
      resetForm();
      toast({ title: "Zona tahrirlandi", status: "success", duration: 3000 });
    } catch (err: any) {
      toast({ title: "Tahrirlashda xatolik", description: err.message, status: "error", duration: 3000 });
    }
  }

  function handleEditClick(z: Zone) {
    setEditingZone(z);
    setName(z.name);
    setCode(z.code);
    setKind(z.kind);
    setCapacity(z.capacity ? String(z.capacity) : "");
    const allowed = accTypes.filter((a) => a.allowedZoneCodes?.includes(z.code)).map((a) => a.id);
    setSelectedAccTypes(allowed);
    onEditOpen();
  }

  async function handleDeleteZone(z: Zone) {
    if (!window.confirm(`Rostdan ham ${z.name} zonasini o'chirmoqchimisiz?`)) return;
    try {
      await deleteZoneApi(z.id as string);
      setZones(prev => prev.filter(x => x.id !== z.id));
      toast({ title: "Zona o'chirildi", status: "success", duration: 2500 });
    } catch (err: any) {
      toast({
        title: "O'chirishda xatolik",
        description: err.message || "Ushbu zonaga tegishli ma'lumotlar bor",
        status: "error",
        duration: 4000,
      });
    }
  }

  return (
    <Box>
      <Topbar title="Zonalar" subtitle={`${zones.length} ta bino/zona ro'yxatga olingan`} />
      <Box px={8} py={6}>
        <Flex justify="flex-end" mb={4}>
          <Button leftIcon={<LuPlus size={15} />} onClick={onOpen}>
            Yangi zona
          </Button>
        </Flex>

        {loading ? (
          <Flex justify="center" py={12}>
            <Spinner color="gold.400" size="lg" />
          </Flex>
        ) : (
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap={5}>
            {zones.map((z) => {
              const pct = z.capacity ? Math.round((z.currentInside / z.capacity) * 100) : null;
              const allowedFor = accTypes.filter((a) => a.allowedZoneCodes?.includes(z.code));
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
                    <HStack>
                      <Badge
                        bg={z.kind === "kirish_chiqish" ? "signal.blueDim" : "surface.600"}
                        color={z.kind === "kirish_chiqish" ? "signal.blue" : "ink.500"}
                        px={2}
                        py={0.5}
                      >
                        {z.kind === "kirish_chiqish" ? "IN / OUT" : "Ochiq"}
                      </Badge>
                      <IconButton
                        aria-label="Tahrirlash"
                        icon={<LuEdit size={14} />}
                        size="xs"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => handleEditClick(z)}
                      />
                      <IconButton
                        aria-label="O'chirish"
                        icon={<LuTrash size={14} />}
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDeleteZone(z)}
                      />
                    </HStack>
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

                  <HStack fontSize="12px" color="ink.500" mb={3} justify="space-between">
                    <HStack spacing={1.5}>
                      <LuScanLine size={13} />
                      <Text>{z.devices?.length || 0} ta faol qurilma</Text>
                    </HStack>
                    <Button 
                      size="xs" 
                      variant="outline" 
                      onClick={() => {
                        setSelectedZoneForDevices(z);
                        onDeviceModalOpen();
                      }}
                    >
                      Boshqarish
                    </Button>
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
                        Barcha turlar
                      </Text>
                    )}
                  </Wrap>
                </Box>
              );
            })}
          </Grid>
        )}
      </Box>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          resetForm();
          onClose();
        }}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent bg="surface.800" border="1px solid" borderColor="line.900">
          <ModalHeader color="ink.900">Yangi zona / bino qo&apos;shish</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4}>
                <FormControl>
                  <FormLabel fontSize="13px" color="ink.500">Nomi</FormLabel>
                  <Input
                    bg="canvas.900"
                    borderColor="line.800"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="masalan: Sport zali B"
                  />
                </FormControl>
                <FormControl maxW="140px">
                  <FormLabel fontSize="13px" color="ink.500">Kodi</FormLabel>
                  <Input
                    bg="canvas.900"
                    borderColor="line.800"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="HALLB"
                  />
                </FormControl>
              </HStack>
              <HStack spacing={4}>
                <FormControl>
                  <FormLabel fontSize="13px" color="ink.500">Zona turi</FormLabel>
                  <Select
                    bg="canvas.900"
                    borderColor="line.800"
                    value={kind}
                    onChange={(e) => setKind(e.target.value as ZoneKind)}
                  >
                    <option value="kirish_chiqish">Kirish-chiqish nazorati</option>
                    <option value="ochiq">Ochiq (nazoratsiz)</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="13px" color="ink.500">Skaner nuqtalari soni</FormLabel>
                  <Input
                    type="number"
                    min={1}
                    bg="canvas.900"
                    borderColor="line.800"
                    value={scanPoints}
                    onChange={(e) => setScanPoints(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="13px" color="ink.500">Sig&apos;imi (ixtiyoriy)</FormLabel>
                  <Input
                    type="number"
                    min={0}
                    bg="canvas.900"
                    borderColor="line.800"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="masalan: 200"
                  />
                </FormControl>
              </HStack>
              <FormControl mt={2}>
                <FormLabel fontSize="13px" color="ink.500">Ruxsat etilgan akkreditatsiya turlari</FormLabel>
                <CheckboxGroup value={selectedAccTypes} onChange={(val) => setSelectedAccTypes(val as string[])}>
                  <Wrap spacing={3}>
                    {accTypes.map((a) => (
                      <WrapItem key={a.id}>
                        <Checkbox value={a.id} colorScheme="blue" size="sm">
                          <Text fontSize="13px" color="ink.900">{a.name}</Text>
                        </Checkbox>
                      </WrapItem>
                    ))}
                  </Wrap>
                </CheckboxGroup>
                <Text fontSize="11px" color="ink.500" mt={2}>
                  Hech narsa tanlanmasa, zona barcha uchun ochiq bo'ladi.
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Bekor qilish
            </Button>
            <Button onClick={createZone}>Zonani yaratish</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => { resetForm(); onEditClose(); }} size="lg">
        <ModalOverlay />
        <ModalContent bg="surface.800" border="1px solid" borderColor="line.900">
          <ModalHeader color="ink.900">Zonani tahrirlash</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4}>
                <FormControl>
                  <FormLabel fontSize="13px" color="ink.500">Nomi</FormLabel>
                  <Input bg="canvas.900" borderColor="line.800" value={name} onChange={(e) => setName(e.target.value)} />
                </FormControl>
                <FormControl maxW="140px">
                  <FormLabel fontSize="13px" color="ink.500">Kodi</FormLabel>
                  <Input bg="canvas.900" borderColor="line.800" value={code} onChange={(e) => setCode(e.target.value)} />
                </FormControl>
              </HStack>
              <HStack spacing={4}>
                <FormControl>
                  <FormLabel fontSize="13px" color="ink.500">Zona turi</FormLabel>
                  <Select bg="canvas.900" borderColor="line.800" value={kind} onChange={(e) => setKind(e.target.value as ZoneKind)}>
                    <option value="kirish_chiqish">Kirish-chiqish nazorati</option>
                    <option value="ochiq">Ochiq (nazoratsiz)</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="13px" color="ink.500">Sig&apos;imi</FormLabel>
                  <Input type="number" min={0} bg="canvas.900" borderColor="line.800" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                </FormControl>
              </HStack>
              <FormControl mt={2}>
                <FormLabel fontSize="13px" color="ink.500">Ruxsat etilgan akkreditatsiya turlari</FormLabel>
                <CheckboxGroup value={selectedAccTypes} onChange={(val) => setSelectedAccTypes(val as string[])}>
                  <Wrap spacing={3}>
                    {accTypes.map((a) => (
                      <WrapItem key={a.id}>
                        <Checkbox value={a.id} colorScheme="blue" size="sm">
                          <Text fontSize="13px" color="ink.900">{a.name}</Text>
                        </Checkbox>
                      </WrapItem>
                    ))}
                  </Wrap>
                </CheckboxGroup>
                <Text fontSize="11px" color="ink.500" mt={2}>Hech narsa tanlanmasa, barcha turlar ruxsat etiladi.</Text>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => { resetForm(); onEditClose(); }}>Bekor qilish</Button>
            <Button onClick={updateZone} colorScheme="blue">Saqlash</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <DeviceManagerModal 
        isOpen={isDeviceModalOpen} 
        onClose={onDeviceModalClose} 
        zone={selectedZoneForDevices}
        onDeviceUpdated={() => loadData()}
      />
    </Box>
  );
}
