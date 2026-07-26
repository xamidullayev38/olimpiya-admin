import { useState } from "react";
import {
  Flex,
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
  useToast,
} from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";
import { SystemRole } from "@/shared/types";
import { roles as initialRoles, permissionCatalog } from "@/shared/api/mock-data";

const permissionGroups = Array.from(new Set(permissionCatalog.map((p) => p.group)));

export function RolesPanel() {
  const [roles, setRoles] = useState<SystemRole[]>(initialRoles);
  const [selectedId, setSelectedId] = useState(initialRoles[0]?.id || "R-1");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newName, setNewName] = useState("");
  const [newPerms, setNewPerms] = useState<string[]>([]);
  const toast = useToast();

  const selected = roles.find((r) => r.id === selectedId) || roles[0] || {
    name: "Rol",
    usersCount: 0,
    permissions: [],
  };

  function togglePermission(perm: string) {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === selectedId
          ? {
              ...r,
              permissions: r.permissions.includes(perm)
                ? r.permissions.filter((p) => p !== perm)
                : [...r.permissions, perm],
            }
          : r
      )
    );
  }

  function createRole() {
    if (newName.trim() === "") return;
    const role: SystemRole = {
      id: `R-${Date.now()}`,
      name: newName.trim(),
      permissions: newPerms,
      usersCount: 0,
    };
    setRoles((prev) => [...prev, role]);
    setSelectedId(role.id);
    setNewName("");
    setNewPerms([]);
    onClose();
    toast({
      title: "Yangi rol yaratildi",
      description: `"${role.name}" — ${role.permissions.length} ta ruxsat bilan`,
      status: "success",
      duration: 3000,
    });
  }

  return (
    <>
      <Flex justify="flex-end" mb={4}>
        <Button leftIcon={<LuPlus size={15} />} onClick={onOpen}>
          Yangi rol yaratish
        </Button>
      </Flex>

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
                  {r.usersCount} xodim · {r.permissions.length} ruxsat
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
          <Flex justify="space-between" mb={1}>
            <Text fontFamily="heading" fontWeight="600" fontSize="16px" color="ink.900">
              {selected.name}
            </Text>
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
                  {permissionCatalog
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
                      {permissionCatalog
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
