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
  Wrap,
  WrapItem,
  Badge,
  Switch,
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
  Checkbox,
  CheckboxGroup,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";
import { AccreditationType, AccreditationCode, Zone } from "@/shared/types";
import {
  fetchAccreditationTypes,
  fetchZones,
  createAccreditationTypeApi,
  setAccreditationTypeZonesApi,
} from "@/shared/api/services";
import StatusPill from "@/shared/ui/StatusPill/StatusPill";

export function AccreditationTypesPanel() {
  const [types, setTypes] = useState<AccreditationType[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState("#4C8DFF");
  const [mealAllowed, setMealAllowed] = useState(true);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);

  async function loadData() {
    setLoading(true);
    try {
      const aData = await fetchAccreditationTypes();
      const zData = await fetchZones();
      setTypes(aData);
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

  const canSave = name.trim() !== "" && code.trim() !== "";

  async function addType() {
    if (!canSave) return;
    try {
      const created = await createAccreditationTypeApi({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        color,
        mealAllowed,
      });

      if (selectedZones.length > 0) {
        const zoneIds = zones
          .filter((z) => selectedZones.includes(z.code))
          .map((z) => z.id)
          .filter(Boolean) as string[];
        if (zoneIds.length > 0) {
          await setAccreditationTypeZonesApi(created.code, zoneIds);
        }
      }

      const updatedTypes = await fetchAccreditationTypes();
      setTypes(updatedTypes);
      setName("");
      setCode("");
      setSelectedZones([]);
      setMealAllowed(true);
      onClose();
      toast({ title: "Akkreditatsiya turi va ruxsatlar saqlandi", status: "success", duration: 3000 });
    } catch (err: any) {
      toast({ title: "Saqlashda xatolik", description: err.message, status: "error", duration: 3000 });
    }
  }

  return (
    <>
      <Flex justify="flex-end" mb={4}>
        <Button leftIcon={<LuPlus size={15} />} onClick={onOpen}>
          Yangi tur qo'shish
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
                <Th>Nomi</Th>
                <Th>Kodi</Th>
                <Th>Rang</Th>
                <Th>Ruxsat etilgan zonalar</Th>
                <Th>Ovqatlanish</Th>
              </Tr>
            </Thead>
            <Tbody>
              {types.map((t) => {
                const openZoneCodes = zones.filter((z) => z.isAllAllowed).map((z) => z.code);
                const combinedZoneCodes = Array.from(new Set([...(t.allowedZoneCodes || []), ...openZoneCodes]));

                return (
                  <Tr key={t.code} _hover={{ bg: "surface.700" }}>
                    <Td fontWeight="600" color="ink.900">
                      {t.name}
                    </Td>
                    <Td fontFamily="mono" fontSize="12px">{t.code}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Box w="14px" h="14px" borderRadius="4px" bg={t.color} />
                        <Text fontFamily="mono" fontSize="11px" color="ink.500">{t.color}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Wrap spacing={1}>
                        {combinedZoneCodes.map((zc) => (
                          <WrapItem key={zc}>
                            <Badge bg="surface.600" color="ink.700" fontSize="10px">{zc}</Badge>
                          </WrapItem>
                        ))}
                        {combinedZoneCodes.length === 0 && (
                          <Text fontSize="12px" color="ink.500">—</Text>
                        )}
                      </Wrap>
                    </Td>
                    <Td>
                      <StatusPill
                        label={t.mealAllowed ? "Ruxsat bor" : "Ruxsat yo'q"}
                        tone={t.mealAllowed ? "success" : "neutral"}
                      />
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent className="glass-panel">
          <ModalHeader color="ink.900">Yangi akkreditatsiya turi</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <HStack spacing={4} mb={4} align="start">
              <FormControl>
                <FormLabel fontSize="13px" color="ink.500">Nomi</FormLabel>
                <Input variant="outline" value={name} onChange={(e) => setName(e.target.value)} placeholder="masalan: Texnik xodim" />
              </FormControl>
              <FormControl maxW="140px">
                <FormLabel fontSize="13px" color="ink.500">Kodi</FormLabel>
                <Input variant="outline" value={code} onChange={(e) => setCode(e.target.value)} placeholder="TECH" />
              </FormControl>
              <FormControl maxW="120px">
                <FormLabel fontSize="13px" color="ink.500">Rang</FormLabel>
                <Input type="color" variant="outline" h="40px" p={1} value={color} onChange={(e) => setColor(e.target.value)} />
              </FormControl>
            </HStack>

            <FormControl mb={4}>
              <FormLabel fontSize="13px" color="ink.500" mb={2}>Ruxsat etilgan zonalar</FormLabel>
              <CheckboxGroup value={selectedZones} onChange={(v) => setSelectedZones(v as string[])}>
                <Wrap spacing={3}>
                  {zones.map((z) => (
                    <WrapItem key={z.code}>
                      <Checkbox value={z.code} colorScheme="yellow" size="sm">
                        <Text fontSize="13px" color="ink.700">{z.name}</Text>
                      </Checkbox>
                    </WrapItem>
                  ))}
                </Wrap>
              </CheckboxGroup>
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel fontSize="13px" color="ink.500" mb={0}>Ovqatlanishga ruxsat</FormLabel>
              <Switch colorScheme="yellow" isChecked={mealAllowed} onChange={(e) => setMealAllowed(e.target.checked)} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Bekor qilish</Button>
            <Button onClick={addType} isDisabled={!canSave}>Saqlash</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
