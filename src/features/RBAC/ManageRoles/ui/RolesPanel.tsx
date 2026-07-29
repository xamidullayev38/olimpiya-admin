import { useEffect, useState } from "react";
import {
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  Badge,
  Box,
  Checkbox,
  CheckboxGroup,
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
  Spinner,
  useToast,
} from "@chakra-ui/react";
import {
  fetchRoles,
  fetchPermissions,
  createRoleApi,
  assignRolePermissionsApi,
  deleteRoleApi,
} from "@/shared/api/services";
import { SystemRole, Permission } from "@/shared/types";
import { LuTrash, LuPlus } from "react-icons/lu";

export function RolesPanel() {
  const [roles, setRoles] = useState<SystemRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newName, setNewName] = useState("");
  const [newPerms, setNewPerms] = useState<string[]>([]);
  const toast = useToast();

  async function loadData() {
    setLoading(true);
    try {
      const rData = await fetchRoles();
      const pData = await fetchPermissions();
      setRoles(rData);
      setPermissions(pData);
      if (rData.length > 0 && !selectedId) {
        setSelectedId(rData[0].id);
      }
    } catch {
      // silent catch
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const permissionGroups = Array.from(new Set(permissions.map((p) => p.group)));

  const selected = roles.find((r) => r.id === selectedId) || roles[0] || {
    name: "Rol",
    usersCount: 0,
    permissions: [],
  };

  async function togglePermission(permKey: string) {
    if (!selected.id) return;
    const currentPerms = selected.permissions || [];
    const nextPerms = currentPerms.includes(permKey)
      ? currentPerms.filter((p) => p !== permKey)
      : [...currentPerms, permKey];

    setRoles((prev) =>
      prev.map((r) => (r.id === selected.id ? { ...r, permissions: nextPerms } : r))
    );

    const ok = await assignRolePermissionsApi(selected.id, nextPerms);
    if (!ok) {
      toast({ title: "Ruxsatlarni yangilashda xatolik", status: "warning", duration: 2500 });
    }
  }

  async function createRole() {
    if (newName.trim() === "") return;
    try {
      const role = await createRoleApi({ name: newName.trim() });
      if (newPerms.length > 0) {
        await assignRolePermissionsApi(role.id, newPerms);
        role.permissions = newPerms;
      }
      setRoles((prev) => [...prev, role]);
      setSelectedId(role.id);
      setNewName("");
      setNewPerms([]);
      onClose();
      toast({
        title: "Yangi rol yaratildi",
        description: `"${role.name}"`,
        status: "success",
        duration: 3000,
      });
    } catch (err: any) {
      toast({ title: "Rol yaratishda xatolik", description: err.message, status: "error", duration: 3000 });
    }
  }

  async function deleteSelectedRole() {
    if (!selected.id || selected.builtIn) return;
    if (!window.confirm(`Rostdan ham "${selected.name}" rolini o'chirmoqchimisiz?`)) return;
    
    try {
      await deleteRoleApi(selected.id);
      setRoles(prev => {
        const next = prev.filter(r => r.id !== selected.id);
        if (next.length > 0) setSelectedId(next[0].id);
        else setSelectedId("");
        return next;
      });
      toast({ title: "Rol o'chirildi", status: "success", duration: 2500 });
    } catch (err: any) {
      toast({
        title: "O'chirishda xatolik",
        description: err.message || "Tizimda xatolik",
        status: "error",
        duration: 4000,
      });
    }
  }

  return (
    <>
      <Flex justify="flex-end" mb={4}>
        <Button leftIcon={<LuPlus size={15} />} onClick={onOpen}>
          Yangi rol yaratish
        </Button>
      </Flex>

      {loading ? (
        <Flex justify="center" py={8}>
          <Spinner color="gold.400" size="lg" />
        </Flex>
      ) : (
        <Flex gap={5} align="start">
          <VStack
            w="300px"
            flexShrink={0}
            align="stretch"
            spacing={0}
            bg="surface.800"
            border="1px solid"
            borderColor="line.900"
            borderRadius="lg"
            overflow="hidden"
            className="glass-panel"
          >
            {roles.map((r) => (
              <Flex
                key={r.id}
                px={4}
                py={3}
                justify="space-between"
                align="center"
                cursor="pointer"
                bg={r.id === selectedId ? "surface.700" : "transparent"}
                borderLeft="2px solid"
                borderColor={r.id === selectedId ? "gold.400" : "transparent"}
                _hover={{ bg: "surface.700" }}
                onClick={() => setSelectedId(r.id)}
                borderBottom="1px solid"
                borderBottomColor="line.900"
                _last={{ borderBottom: "none" }}
              >
                <VStack align="start" spacing={0}>
                  <Text fontSize="13px" fontWeight="600" color="ink.900">
                    {r.name}
                  </Text>
                  <Text fontSize="11px" color="ink.500">
                    {r.usersCount} xodim · {r.permissions?.length || 0} ruxsat
                  </Text>
                </VStack>
                {r.builtIn && (
                  <Badge bg="surface.600" color="ink.500" fontSize="10px">
                    asosiy
                  </Badge>
                )}
              </Flex>
            ))}
          </VStack>

          <Box
            flex={1}
            bg="surface.800"
            border="1px solid"
            borderColor="line.900"
            borderRadius="lg"
            p={5}
            className="glass-panel"
          >
            <Flex justify="space-between" mb={1} align="center">
              <HStack>
                <Text fontFamily="heading" fontWeight="600" fontSize="16px" color="ink.900">
                  {selected.name}
                </Text>
                {!selected.builtIn && (
                  <Button size="xs" variant="ghost" colorScheme="red" leftIcon={<LuTrash />} onClick={deleteSelectedRole}>
                    O'chirish
                  </Button>
                )}
              </HStack>
              <Text fontSize="12px" color="ink.500">
                {selected.usersCount} ta xodim ushbu rolga ega
              </Text>
            </Flex>
            <Text fontSize="12px" color="ink.500" mb={5}>
              Ruxsatlarni belgilang — o'zgarish darhol kuchga kiradi.
            </Text>

            <VStack align="stretch" spacing={5}>
              {permissionGroups.map((group) => (
                <Box key={group}>
                  <Text fontSize="11px" color="gold.400" letterSpacing="0.04em" mb={2}>
                    {group.toUpperCase()}
                  </Text>
                  <VStack align="stretch" spacing={2}>
                    {permissions
                      .filter((p) => p.group === group)
                      .map((p) => (
                        <Checkbox
                          key={p.key}
                          isChecked={selected.permissions?.includes(p.key)}
                          onChange={() => togglePermission(p.key)}
                          colorScheme="yellow"
                          size="sm"
                        >
                          <Text fontSize="13px" color="ink.700">
                            {p.label}
                          </Text>
                          <Text fontFamily="mono" fontSize="10px" color="ink.300">
                            {p.key}
                          </Text>
                        </Checkbox>
                      ))}
                  </VStack>
                </Box>
              ))}
            </VStack>
          </Box>
        </Flex>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent className="glass-panel">
          <ModalHeader color="ink.900">Yangi rol yaratish</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel fontSize="13px" color="ink.500">
                Rol nomi
              </FormLabel>
              <Input
                variant="outline"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="masalan: Media koordinatori"
              />
            </FormControl>
            <Text fontSize="13px" color="ink.500" mb={2}>
              Ruxsatlar
            </Text>
            <CheckboxGroup value={newPerms} onChange={(v) => setNewPerms(v as string[])}>
              <VStack align="stretch" spacing={4} maxH="320px" overflowY="auto" pr={1}>
                {permissionGroups.map((group) => (
                  <Box key={group}>
                    <Text fontSize="11px" color="gold.400" mb={1.5}>
                      {group.toUpperCase()}
                    </Text>
                    <VStack align="stretch" spacing={1.5}>
                      {permissions
                        .filter((p) => p.group === group)
                        .map((p) => (
                          <Checkbox key={p.key} value={p.key} colorScheme="yellow" size="sm">
                            <Text fontSize="13px" color="ink.700">
                              {p.label}
                            </Text>
                          </Checkbox>
                        ))}
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </CheckboxGroup>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Bekor qilish
            </Button>
            <Button onClick={createRole}>Rolni yaratish</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
