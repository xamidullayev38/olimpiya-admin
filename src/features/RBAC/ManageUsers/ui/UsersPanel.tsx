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
} from "@chakra-ui/react";
import { LuPlus, LuTrash } from "react-icons/lu";
import { SystemUser } from "@/shared/types";
import { fetchUsers, fetchRoles, createUserApi, deleteUserApi } from "@/shared/api/services";
import StatusPill from "@/shared/ui/StatusPill/StatusPill";

export function UsersPanel() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const toast = useToast();

  async function loadData() {
    setLoading(true);
    try {
      const uData = await fetchUsers();
      const rData = await fetchRoles();
      setUsers(uData);
      setRoles(rData);
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

  async function addUser() {
    if (name.trim() === "") return;
    try {
      const uName = username.trim() || name.trim().toLowerCase().replace(/\s+/g, ".");
      const created = await createUserApi({
        fullName: name.trim(),
        username: uName,
        password: password || "Password123!",
        roleIds: roleId ? [roleId] : [],
      });
      setUsers((prev) => [created, ...prev]);
      setName("");
      setUsername("");
      setPassword("");
      onClose();
      toast({ title: "Xodim muvaffaqiyatli saqlandi", status: "success", duration: 3000 });
    } catch (err: any) {
      toast({ title: "Xodim qo'shishda xatolik", description: err.message, status: "error", duration: 3000 });
    }
  }

  async function handleDeleteUser(id: string, fullName: string) {
    if (!window.confirm(`Rostdan ham ${fullName} (hodim) ni o'chirmoqchimisiz?`)) return;
    try {
      await deleteUserApi(id);
      setUsers(prev => prev.filter(x => x.id !== id));
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
        <Box bg="surface.800" border="1px solid" borderColor="line.900" borderRadius="lg" overflow="hidden" className="glass-panel" style={{ background: "rgba(27, 32, 40, 0.4)" }}>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>F.I.Sh</Th>
                <Th>Login</Th>
                <Th>Rol(lar)</Th>
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
                        const r = roles.find((x) => x.id === rid);
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
                    <IconButton
                      aria-label="O'chirish"
                      icon={<LuTrash size={14} />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDeleteUser(u.id, u.fullName)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent className="glass-panel">
          <ModalHeader color="ink.900">Yangi xodim qo'shish</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel fontSize="13px" color="ink.500">
                F.I.Sh
              </FormLabel>
              <Input
                variant="outline"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="masalan: Kamron Yusupov"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel fontSize="13px" color="ink.500">
                Foydalanuvchi nomi (Login)
              </FormLabel>
              <Input
                variant="outline"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="kamron.yusupov"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel fontSize="13px" color="ink.500">
                Parol
              </FormLabel>
              <Input
                type="password"
                variant="outline"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="13px" color="ink.500">
                Rol
              </FormLabel>
              <Select
                variant="outline"
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
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Bekor qilish
            </Button>
            <Button onClick={addUser}>Qo'shish</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
