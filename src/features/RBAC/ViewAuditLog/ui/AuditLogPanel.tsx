import { useEffect, useMemo, useState } from "react";
import {
  Flex,
  Text,
  Select,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import { fetchAuditLogs } from "@/shared/api/services";
import { AuditLogEntry } from "@/shared/types";

function formatAction(action: string) {
  const map: Record<string, string> = {
    "zone.create": "Zona yaratish",
    "zone.update": "Zona tahrirlash",
    "zone.delete": "Zona o'chirish",
    "device.create": "Qurilma qo'shish",
    "device.revoke": "Qurilma bekor qilish",
    "device.delete": "Qurilma o'chirish",
    "user.create": "Xodim qo'shish",
    "user.update": "Xodim tahrirlash",
    "user.delete": "Xodim o'chirish",
    "role.create": "Rol yaratish",
    "role.delete": "Rol o'chirish",
    "role.permissions.update": "Ruxsatlarni yangilash",
    "participant.create": "Ishtirokchi qo'shish",
    "participant.update": "Ishtirokchi tahrirlash",
    "participant.delete": "Ishtirokchi o'chirish",
    "participant.import": "Ishtirokchilarni yuklash",
    "accreditationType.create": "Akkreditatsiya turi qo'shish",
  };
  return map[action] || action;
}

function formatTarget(target: string, details?: string) {
  try {
    const meta = details ? JSON.parse(details) : {};
    const body = Array.isArray(meta.body) ? meta.body[0] : meta.body;
    
    if (target.startsWith("device:") || target === "device:") {
      const name = body?.name || body?.deviceKey || target.split(":")[1]?.slice(0, 8);
      return `Qurilma: ${name || "Noma'lum"}`;
    }
    if (target.startsWith("zone:") || target === "zone:") {
      const name = body?.name || body?.code || target.split(":")[1]?.slice(0, 8);
      return `Zona: ${name || "Noma'lum"}`;
    }
    if (target.startsWith("user:") || target === "user:") {
      const name = body?.username || body?.fullName || target.split(":")[1]?.slice(0, 8);
      return `Xodim: ${name || "Noma'lum"}`;
    }
    if (target.startsWith("participant:") || target === "participant:") {
      const name = body?.firstName ? `${body.firstName} ${body.lastName || ""}` : target.split(":")[1]?.slice(0, 8);
      return `Ishtirokchi: ${name || "Noma'lum"}`;
    }
    if (target.startsWith("role:") || target === "role:") {
      const name = body?.name || target.split(":")[1]?.slice(0, 8);
      return `Rol: ${name || "Noma'lum"}`;
    }
  } catch {}
  return target;
}

function AuditDetails({ details }: { details?: string }) {
  if (!details) return <Text color="ink.500">—</Text>;
  try {
    const meta = JSON.parse(details);
    const body = Array.isArray(meta.body) ? meta.body[0] : meta.body;
    if (body && typeof body === "object" && Object.keys(body).length > 0) {
      const keys = Object.keys(body).filter(k => k !== "password" && body[k] !== undefined && body[k] !== null);
      if (keys.length > 0) {
        return (
          <Flex wrap="wrap" gap={1}>
            {keys.slice(0, 3).map(k => (
              <Badge key={k} fontSize="10px" bg="surface.600" color="ink.500" textTransform="none">
                {k}: {typeof body[k] === 'object' ? '...' : String(body[k]).slice(0, 15)}
              </Badge>
            ))}
            {keys.length > 3 && <Badge fontSize="10px" bg="transparent" color="ink.700">+{keys.length - 3}</Badge>}
          </Flex>
        );
      }
    }
  } catch {}
  return <Text fontSize="12px" color="ink.500">Tafsilotlar mavjud emas</Text>;
}

export function AuditLogPanel() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actorFilter, setActorFilter] = useState("ALL");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchAuditLogs();
        setLogs(data);
      } catch {
        // silent catch
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const actors = useMemo(() => Array.from(new Set(logs.map((a) => a.actor))), [logs]);
  const filtered = useMemo(
    () => (actorFilter === "ALL" ? logs : logs.filter((a) => a.actor === actorFilter)),
    [actorFilter, logs]
  );

  return (
    <>
      <Flex justify="space-between" mb={4}>
        <Text fontSize="13px" color="ink.500">
          Kim, qachon, nima o'zgartirgani — barcha admin panel amallari
        </Text>
        <Select maxW="220px" variant="outline" value={actorFilter} onChange={(e) => setActorFilter(e.target.value)}>
          <option value="ALL" style={{ background: "#12151B" }}>Barcha xodimlar</option>
          {actors.map((a) => (
            <option key={a} value={a} style={{ background: "#12151B" }}>{a}</option>
          ))}
        </Select>
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
                <Th>Xodim</Th>
                <Th>Amal</Th>
                <Th>Obyekt</Th>
                <Th>Vaqt</Th>
                <Th>Izoh (O'zgarishlar)</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((a) => (
                <Tr key={a.id} _hover={{ bg: "surface.700" }}>
                  <Td fontWeight="600" color="ink.900">{a.actor}</Td>
                  <Td>
                    <Badge bg="surface.600" color="ink.300" textTransform="none" px={2} py={0.5} fontWeight="500">
                      {formatAction(a.action)}
                    </Badge>
                  </Td>
                  <Td color="ink.700" fontWeight="500">{formatTarget(a.target, a.details)}</Td>
                  <Td fontFamily="mono" fontSize="12px" color="ink.500">{a.timestamp}</Td>
                  <Td>
                    <AuditDetails details={a.details} />
                  </Td>
                </Tr>
              ))}
              {filtered.length === 0 && (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={6} color="ink.500">
                    Hozircha amallar tarixi yo'q.
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
