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
} from "@chakra-ui/react";
import { fetchAuditLogs } from "@/shared/api/services";
import { AuditLogEntry } from "@/shared/types";

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
                <Th>Izoh</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((a) => (
                <Tr key={a.id} _hover={{ bg: "surface.700" }}>
                  <Td fontWeight="600" color="ink.900">{a.actor}</Td>
                  <Td>{a.action}</Td>
                  <Td color="ink.700">{a.target}</Td>
                  <Td fontFamily="mono" fontSize="12px" color="ink.500">{a.timestamp}</Td>
                  <Td>
                    <Text fontSize="12px" color="ink.500" noOfLines={1} maxW="260px">
                      {a.details ?? "—"}
                    </Text>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </>
  );
}
