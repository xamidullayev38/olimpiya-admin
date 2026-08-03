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
  Wrap,
  WrapItem,
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
  IconButton,
  HStack,
  VStack,
  Text,
} from "@chakra-ui/react";
import { LuPlus, LuTrash, LuPencil, LuMapPin } from "react-icons/lu";
import { SystemUser, Zone } from "@/shared/types";
import {
  fetchUsers,
  fetchRoles,
  fetchZones,
  createUserApi,
  updateUserApi,
  deleteUserApi,
} from "@/shared/api/services";
import StatusPill from "@/shared/ui/StatusPill/StatusPill";

export function UsersPanel() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal disclosures
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  // Create form state
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [assignedZoneId, setAssignedZoneId] = useState("");

  // Edit form state
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editRoleId, setEditRoleId] = useState("");
  const [editZoneId, setEditZoneId] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  const toast = useToast();

  async function loadData() {
    setLoading(true);
    try {
      const uData = await fetchUsers();
      const rData = await fetchRoles();
      const zData = await fetchZones();
      setUsers(uData);
      setRoles(rData);
      setZones(zData);
      if (rData.length > 0 && !roleId) {
        setRoleId(rData[0].id);
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

  function resetCreateForm() {
    setName("");
    setUsername("");
    setPassword("");
    setAssignedZoneId("");
    if (roles.length > 0) setRoleId(roles[0].id);
  }

  async function addUser() {
    if (name.trim() === "") {
      toast({ title: "F.I.Sh kiritilishi shart", status: "warning" });
      return;
    }
    try {
      const uName = username.trim() || name.trim().toLowerCase().replace(/\s+/g, ".");
      const created = await createUserApi({
        fullName: name.trim(),
        username: uName,
        password: password,
        roleIds: roleId ? [roleId] : [],
        assignedZoneId: assignedZoneId || undefined,
      });

      // Enrich created user with assignedZone object if applicable
      if (assignedZoneId) {
        const foundZone = zones.find((z) => (z.id || z.code) === assignedZoneId);
        if (foundZone) {
          created.assignedZone = {
            id: foundZone.id || foundZone.code,
            name: foundZone.name,
            code: foundZone.code,
          };
        }
      }

      setUsers((prev) => [created, ...prev]);
      resetCreateForm();
      onClose();
      toast({ title: "Xodim muvaffaqiyatli saqlandi", status: "success", duration: 3000 });
    } catch (err: any) {
      toast({ title: "Xodim qo'shishda xatolik", description: err.message, status: "error", duration: 3000 });
    }
  }

  function handleOpenEdit(u: SystemUser) {
    setEditingUser(u);
    setEditName(u.fullName);
    setEditRoleId(u.roleIds[0] || (roles[0]?.id ?? ""));
    setEditZoneId(u.assignedZoneId || u.assignedZone?.id || "");
    setEditIsActive(u.status === "faol");
    onEditOpen();
  }

  async function handleSaveEdit() {
    if (!editingUser) return;
    if (editName.trim() === "") {
      toast({ title: "F.I.Sh kiritilishi shart", status: "warning" });
      return;
    }

    try {
      const updated = await updateUserApi(editingUser.id, {
        fullName: editName.trim(),
        roleIds: editRoleId ? [editRoleId] : [],
        assignedZoneId: editZoneId || undefined,
        isActive: editIsActive,
      });

      const foundZone = zones.find((z) => (z.id || z.code) === editZoneId);
      const zoneObj = foundZone
        ? { id: foundZone.id || foundZone.code, name: foundZone.name, code: foundZone.code }
        : undefined;

      setUsers((prev) =>
        prev.map((x) =>
          x.id === editingUser.id
            ? {
                ...x,
                fullName: updated.fullName,
                roleIds: editRoleId ? [editRoleId] : x.roleIds,
                status: editIsActive ? "faol" : "bloklangan",
                assignedZoneId: editZoneId,
                assignedZone: zoneObj,
              }
            : x
        )
      );

      onEditClose();
      toast({ title: "Xodim ma'lumotlari yangilandi", status: "success", duration: 3000 });
    } catch (err: any) {
      toast({ title: "Yangilashda xatolik", description: err.message, status: "error", duration: 3000 });
    }
  }

  async function handleDeleteUser(id: string, fullName: string) {
    if (!window.confirm(`Rostdan ham ${fullName} ni o'chirmoqchimisiz?`)) return;
    try {
      await deleteUserApi(id);
      setUsers((prev) => prev.filter((x) => x.id !== id));
      toast({ title: "Xodim o'chirildi", status: "success", duration: 2500 });
    } catch (err: any) {
      toast({
        title: "O'chirishda xatolik",
        description: err.message || "Ushbu xodimga tegishli ma'lumotlar mavjud.",
        status: "error",
        duration: 4000,
      });
    }
  }

  return (
    <>
      <Flex justify="flex-end" mb={4}>
        <Button leftIcon={<LuPlus size={15} />} onClick={onOpen}>
          Yangi xodim
        </Button>
      </Flex>

      {loading ? (
        <Flex justify="center" py={8}>
          <Spinner color="gold.400" size="lg" />
        </Flex>
      ) : (
        <Box
          bg="surface.800"
          border="1px solid"
          borderColor="line.900"
          borderRadius="lg"
          overflow="hidden"
          className="glass-panel"
          style={{ background: "rgba(27, 32, 40, 0.4)" }}
        >
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>F.I.Sh</Th>
                <Th>Login</Th>
                <Th>Rol(lar)</Th>
                <Th>Biriktirilgan zona</Th>
                <Th>Holati</Th>
                <Th>Oxirgi faollik</Th>
                <Th isNumeric>Amal</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((u) => (
                <Tr key={u.id} _hover={{ bg: "surface.700" }}>
                  <Td fontWeight="600" color="ink.900">
                    {u.fullName}
                  </Td>
                  <Td fontFamily="mono" fontSize="12px" color="ink.500">
                    {u.username}
                  </Td>
                  <Td>
                    <Wrap spacing={1}>
                      {u.roleIds.map((rid) => {
                        const r = roles.find((x) => x.id === rid || x.name === rid);
                        return (
                          <WrapItem key={rid}>
                            <Badge bg="surface.600" color="ink.700" fontSize="11px">
                              {r?.name ?? rid}
                            </Badge>
                          </WrapItem>
                        );
                      })}
                    </Wrap>
                  </Td>
                  <Td fontSize="12px">
                    {u.assignedZone ? (
                      <HStack spacing={1.5}>
                        <LuMapPin size={13} color="#D4A853" />
                        <Text color="gold.400" fontWeight="500">
                          {u.assignedZone.name} ({u.assignedZone.code})
                        </Text>
                      </HStack>
                    ) : (
                      <Text color="ink.500">—</Text>
                    )}
                  </Td>
                  <Td>
                    <StatusPill
                      label={u.status === "faol" ? "Faol" : "Bloklangan"}
                      tone={u.status === "faol" ? "success" : "danger"}
                    />
                  </Td>
                  <Td fontFamily="mono" fontSize="12px" color="ink.500">
                    {u.lastActive}
                  </Td>
                  <Td isNumeric>
                    <HStack justify="flex-end" spacing={1}>
                      <IconButton
                        aria-label="Tahrirlash"
                        icon={<LuPencil size={14} />}
                        size="xs"
                        variant="ghost"
                        onClick={() => handleOpenEdit(u)}
                      />
                      <IconButton
                        aria-label="O'chirish"
                        icon={<LuTrash size={14} />}
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDeleteUser(u.id, u.fullName)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* CREATE USER MODAL */}
      <Modal isOpen={isOpen} onClose={() => { resetCreateForm(); onClose(); }}>
        <ModalOverlay />
        <ModalContent className="glass-panel" bg="surface.800" border="1px solid" borderColor="line.900">
          <ModalHeader color="ink.900">Yangi xodim / Skaner operatori qo&apos;shish</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="13px" color="ink.500">
                  F.I.Sh
                </FormLabel>
                <Input
                  variant="outline"
                  bg="canvas.900"
                  borderColor="line.800"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="masalan: Kamron Yusupov"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="13px" color="ink.500">
                  Foydalanuvchi nomi (Login)
                </FormLabel>
                <Input
                  variant="outline"
                  bg="canvas.900"
                  borderColor="line.800"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="kamron.yusupov"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="13px" color="ink.500">
                  Parol
                </FormLabel>
                <Input
                  type="password"
                  variant="outline"
                  bg="canvas.900"
                  borderColor="line.800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="13px" color="ink.500">
                  Rol
                </FormLabel>
                <Select
                  variant="outline"
                  bg="canvas.900"
                  borderColor="line.800"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id} style={{ background: "#12151B" }}>
                      {r.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="13px" color="ink.500">
                  Biriktiriladigan Zona (Skaner / Menejer uchun)
                </FormLabel>
                <Select
                  variant="outline"
                  bg="canvas.900"
                  borderColor="line.800"
                  value={assignedZoneId}
                  onChange={(e) => setAssignedZoneId(e.target.value)}
                >
                  <option value="" style={{ background: "#12151B" }}>
                    — Biriktirilmagan / Barcha zonalar —
                  </option>
                  {zones.map((z) => (
                    <option key={z.id || z.code} value={z.id || z.code} style={{ background: "#12151B" }}>
                      {z.name} ({z.code})
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => { resetCreateForm(); onClose(); }}>
              Bekor qilish
            </Button>
            <Button onClick={addUser}>Qo&apos;shish</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent className="glass-panel" bg="surface.800" border="1px solid" borderColor="line.900">
          <ModalHeader color="ink.900">Xodim ma&apos;lumotlarini tahrirlash</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="13px" color="ink.500">
                  F.I.Sh
                </FormLabel>
                <Input
                  variant="outline"
                  bg="canvas.900"
                  borderColor="line.800"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </FormControl>

              <FormControl isDisabled>
                <FormLabel fontSize="13px" color="ink.500">
                  Foydalanuvchi nomi (Login)
                </FormLabel>
                <Input
                  variant="outline"
                  bg="canvas.900"
                  borderColor="line.800"
                  value={editingUser?.username || ""}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="13px" color="ink.500">
                  Rol
                </FormLabel>
                <Select
                  variant="outline"
                  bg="canvas.900"
                  borderColor="line.800"
                  value={editRoleId}
                  onChange={(e) => setEditRoleId(e.target.value)}
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id} style={{ background: "#12151B" }}>
                      {r.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="13px" color="ink.500">
                  Biriktirilgan Zona
                </FormLabel>
                <Select
                  variant="outline"
                  bg="canvas.900"
                  borderColor="line.800"
                  value={editZoneId}
                  onChange={(e) => setEditZoneId(e.target.value)}
                >
                  <option value="" style={{ background: "#12151B" }}>
                    — Biriktirilmagan / Barcha zonalar —
                  </option>
                  {zones.map((z) => (
                    <option key={z.id || z.code} value={z.id || z.code} style={{ background: "#12151B" }}>
                      {z.name} ({z.code})
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="13px" color="ink.500">
                  Holati
                </FormLabel>
                <Select
                  variant="outline"
                  bg="canvas.900"
                  borderColor="line.800"
                  value={editIsActive ? "active" : "blocked"}
                  onChange={(e) => setEditIsActive(e.target.value === "active")}
                >
                  <option value="active" style={{ background: "#12151B" }}>
                    Faol
                  </option>
                  <option value="blocked" style={{ background: "#12151B" }}>
                    Bloklangan
                  </option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Bekor qilish
            </Button>
            <Button onClick={handleSaveEdit}>Saqlash</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
