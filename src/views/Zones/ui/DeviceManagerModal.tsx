import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Button,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Box,
  Divider,
  Flex
} from "@chakra-ui/react";
import { useState } from "react";
import { LuTrash, LuPencil, LuPlus, LuCheck, LuX } from "react-icons/lu";
import { Zone, ScannerDevice } from "@/shared/types";
import { createDeviceApi, updateDeviceApi, deleteDeviceApi } from "@/shared/api/services";

export function DeviceManagerModal({
  isOpen,
  onClose,
  zone,
  onDeviceUpdated,
}: {
  isOpen: boolean;
  onClose: () => void;
  zone: Zone | null;
  onDeviceUpdated: () => void;
}) {
  const toast = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [deviceName, setDeviceName] = useState("");
  const [deviceKey, setDeviceKey] = useState("");

  const resetForm = () => {
    setDeviceName("");
    setDeviceKey("");
    setIsAdding(false);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!zone?.id) return;
    if (!deviceName.trim()) {
      toast({ title: "Loginni kiriting", status: "warning" });
      return;
    }
    if (!deviceKey.trim() || deviceKey.length < 4) {
      toast({ title: "Parol kamida 4 ta belgi bo'lishi kerak", status: "warning" });
      return;
    }

    try {
      await createDeviceApi({
        name: deviceName,
        zoneId: zone.id,
        deviceKey: deviceKey,
      });
      toast({ title: "Qurilma qo'shildi", status: "success" });
      resetForm();
      onDeviceUpdated();
    } catch (e: any) {
      toast({ title: "Xatolik", description: e.message, status: "error" });
    }
  };

  const handleUpdate = async (id: string) => {
    if (!deviceName.trim()) return;
    try {
      await updateDeviceApi(id, {
        name: deviceName,
        deviceKey: deviceKey.trim() ? deviceKey : undefined,
      });
      toast({ title: "Qurilma saqlandi", status: "success" });
      resetForm();
      onDeviceUpdated();
    } catch (e: any) {
      toast({ title: "Xatolik", description: e.message, status: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Qurilmani o'chirib yuborasizmi?")) return;
    try {
      await deleteDeviceApi(id);
      toast({ title: "O'chirildi", status: "success" });
      onDeviceUpdated();
    } catch (e: any) {
      toast({ title: "Xatolik", description: e.message, status: "error" });
    }
  };

  const toggleStatus = async (device: ScannerDevice) => {
    try {
      await updateDeviceApi(device.id, {
        status: device.status === "faol" ? "REVOKED" : "ACTIVE",
      });
      onDeviceUpdated();
    } catch (e: any) {
      toast({ title: "Xatolik", description: e.message, status: "error" });
    }
  };

  if (!zone) return null;

  return (
    <Modal isOpen={isOpen} onClose={() => { resetForm(); onClose(); }} size="lg">
      <ModalOverlay />
      <ModalContent bg="surface.800" border="1px solid" borderColor="line.900" color="ink.900">
        <ModalHeader fontSize="md">
          {zone.name} - Qurilmalari
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack align="stretch" spacing={4}>
            {!isAdding && !editingId && (
              <Button leftIcon={<LuPlus size={16} />} onClick={() => setIsAdding(true)} alignSelf="flex-start" size="sm">
                Yangi skaner qo'shish
              </Button>
            )}

            {(isAdding || editingId) && (
              <Box p={4} bg="canvas.800" borderRadius="md" border="1px solid" borderColor="line.900">
                <Text mb={3} fontWeight="600">{editingId ? "Skanerni tahrirlash" : "Yangi skaner login/paroli"}</Text>
                <HStack spacing={3} mb={4}>
                  <FormControl>
                    <FormLabel fontSize="12px" color="ink.500">Login (qurilma nomi)</FormLabel>
                    <Input
                      size="sm"
                      bg="canvas.900"
                      borderColor="line.800"
                      value={deviceName}
                      onChange={(e) => setDeviceName(e.target.value)}
                      placeholder="masalan: hall-A-1"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="12px" color="ink.500">Parol (ixtiyoriy)</FormLabel>
                    <Input
                      size="sm"
                      bg="canvas.900"
                      borderColor="line.800"
                      value={deviceKey}
                      onChange={(e) => setDeviceKey(e.target.value)}
                      placeholder={editingId ? "O'zgartirmaslik uchun bo'sh qoldiring" : "Qurilma paroli"}
                      type="password"
                    />
                  </FormControl>
                </HStack>
                <HStack>
                  <Button size="sm" onClick={editingId ? () => handleUpdate(editingId) : handleCreate}>
                    Saqlash
                  </Button>
                  <Button size="sm" variant="ghost" onClick={resetForm}>
                    Bekor qilish
                  </Button>
                </HStack>
              </Box>
            )}

            <Divider borderColor="line.900" />

            <VStack align="stretch" spacing={2}>
              {zone.devices && zone.devices.length > 0 ? (
                zone.devices.map((d) => (
                  <Box key={d.id} p={3} bg="canvas.900" borderRadius="md" border="1px solid" borderColor="line.900">
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Text fontWeight="600">{d.name}</Text>
                          <Badge
                            colorScheme={d.status === "faol" ? "green" : "red"}
                            variant="subtle"
                            cursor="pointer"
                            onClick={() => toggleStatus(d)}
                            title="Bosib o'zgartirish"
                          >
                            {d.status === "faol" ? "Faol" : "Bloklangan"}
                          </Badge>
                        </HStack>
                        <Text fontSize="11px" color="ink.500">
                          Oxirgi faollik: {d.lastSeenAt || "Hali ishlatilmagan"}
                        </Text>
                      </VStack>
                      <HStack>
                        <IconButton
                          aria-label="Tahrirlash"
                          icon={<LuPencil size={14} />}
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(d.id);
                            setDeviceName(d.name);
                            setDeviceKey("");
                            setIsAdding(false);
                          }}
                        />
                        <IconButton
                          aria-label="O'chirish"
                          icon={<LuTrash size={14} />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDelete(d.id)}
                        />
                      </HStack>
                    </Flex>
                  </Box>
                ))
              ) : (
                <Text fontSize="13px" color="ink.500" py={4} textAlign="center">
                  Ushbu zonaga biriktirilgan qurilmalar yo'q
                </Text>
              )}
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
