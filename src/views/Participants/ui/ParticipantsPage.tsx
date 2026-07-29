"use client";

import {
  Box,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button,
  useDisclosure,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { LuSearch, LuUpload, LuPlus } from "react-icons/lu";
import Topbar from "@/widgets/Topbar/ui/Topbar";
import { ParticipantTable } from "@/widgets/ParticipantList/ui/ParticipantTable";
import { ParticipantPreview } from "@/widgets/ParticipantList/ui/ParticipantPreview";
import { ParticipantFormModal } from "@/features/Participant/CreateParticipant/ui/ParticipantFormModal";
import { ImportModal } from "@/features/Participant/ImportParticipants/ui/ImportModal";
import { ParticipantHistoryDrawer } from "@/entities/Participant/ui/ParticipantHistoryDrawer";
import BadgeCard from "@/entities/Participant/ui/BadgeCard";
import { Participant, BadgeStatus } from "@/shared/types";
import {
  fetchParticipants,
  createParticipantApi,
  updateParticipantApi,
  importParticipantsApi,
  blockParticipantApi,
  unblockParticipantApi,
  fetchAccreditationTypes,
  fetchParticipantHistory,
} from "@/shared/api/services";

export function ParticipantsPage() {
  const [list, setList] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [accFilter, setAccFilter] = useState<string>("ALL");
  const [accTypes, setAccTypes] = useState<any[]>([]);
  const [selected, setSelected] = useState<Participant | null>(null);
  const [editing, setEditing] = useState<Participant | null>(null);
  const [printTarget, setPrintTarget] = useState<Participant | null>(null);
  const [participantHistory, setParticipantHistory] = useState<any[]>([]);

  const historyDrawer = useDisclosure();
  const formModal = useDisclosure();
  const importModal = useDisclosure();
  const toast = useToast();

  async function openHistory(p: Participant) {
    setSelected(p);
    historyDrawer.onOpen();
    try {
      const hData = await fetchParticipantHistory(p.id);
      setParticipantHistory(hData);
    } catch {
      setParticipantHistory([]);
    }
  }

  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchParticipants({ search: query, accreditation: accFilter });
      const types = await fetchAccreditationTypes();
      setList(data);
      setAccTypes(types);
      if (data.length > 0 && !selected) {
        setSelected(data[0]);
      }
    } catch {
      // silent catch
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [accFilter]);

  const filtered = useMemo(() => {
    return list.filter((p) => {
      const matchesQuery =
        query.trim() === "" ||
        p.fullName.toLowerCase().includes(query.toLowerCase()) ||
        p.badgeId.toLowerCase().includes(query.toLowerCase()) ||
        p.docNumber.toLowerCase().includes(query.toLowerCase());
      const matchesAcc = accFilter === "ALL" || p.accreditation === accFilter;
      return matchesQuery && matchesAcc;
    });
  }, [list, query, accFilter]);

  function openCreate() {
    setEditing(null);
    formModal.onOpen();
  }

  function openEdit(p: Participant) {
    setEditing(p);
    formModal.onOpen();
  }

  async function saveParticipant(fields: any) {
    if (!fields.fullName?.trim()) {
      toast({ title: "F.I.Sh kiritilishi shart", status: "warning", duration: 2500 });
      return;
    }

    try {
      const nameParts = fields.fullName.trim().split(" ");
      const accId = accTypes.find((a) => a.code === fields.accreditation)?.id || fields.accreditation;

      const dataToSave = {
        firstName: nameParts[0] || fields.fullName,
        lastName: nameParts.slice(1).join(" ") || " ",
        pinfl: fields.pinfl,
        documentNumber: fields.docNumber,
        phone: fields.phone,
        organization: fields.organization,
        sportType: fields.sport,
        accreditationTypeId: accId,
      };

      if (editing) {
        const updatedP = await updateParticipantApi(editing.id, dataToSave);
        setList((prev) => prev.map((x) => (x.id === editing.id ? updatedP : x)));
        if (selected?.id === editing.id) setSelected(updatedP);
        toast({
          title: "Ishtirokchi muvaffaqiyatli yangilandi",
          status: "success",
          duration: 3000,
        });
      } else {
        const newP = await createParticipantApi(dataToSave);
        setList((prev) => [newP, ...prev]);
        setSelected(newP);
        toast({
          title: "Ishtirokchi muvaffaqiyatli saqlandi",
          status: "success",
          duration: 3000,
        });
      }
      formModal.onClose();
    } catch (err: any) {
      toast({
        title: "Saqlashda xatolik yuz berdi",
        description: err.message,
        status: "error",
        duration: 3500,
      });
    }
  }

  async function toggleBlock(p: Participant) {
    const isBlocking = p.badgeStatus !== "bloklangan";
    const ok = isBlocking ? await blockParticipantApi(p.id) : await unblockParticipantApi(p.id);
    const nextStatus: BadgeStatus = isBlocking ? "bloklangan" : "faol";
    const updated = { ...p, badgeStatus: nextStatus };

    setList((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    if (selected?.id === p.id) setSelected(updated);

    toast({
      title: nextStatus === "bloklangan" ? "Badge bloklandi" : "Badge blokdan chiqarildi",
      status: nextStatus === "bloklangan" ? "warning" : "success",
      duration: 2500,
    });
  }

  function printBadge(p: Participant) {
    setPrintTarget(p);
    requestAnimationFrame(() => {
      window.print();
      setPrintTarget(null);
    });
  }

  return (
    <Box>
      <Topbar title="Ishtirokchilar" subtitle={`${list.length} ta ro'yxatga olingan shaxs`} />
      <Flex px={8} py={6} gap={6} align="start">
        <Box flex={1} minW={0}>
          <Flex justify="space-between" mb={4} gap={3} wrap="wrap">
            <HStack spacing={3} flex={1} minW="280px">
              <InputGroup maxW="320px">
                <InputLeftElement pointerEvents="none">
                  <LuSearch color="#5C6577" size={16} />
                </InputLeftElement>
                <Input
                  variant="outline"
                  placeholder="F.I.Sh, badge ID yoki hujjat raqami"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </InputGroup>
              <Select
                maxW="220px"
                variant="outline"
                value={accFilter}
                onChange={(e) => setAccFilter(e.target.value)}
              >
                <option value="ALL" style={{ background: "#12151B" }}>Barcha turlar</option>
                {accTypes.map((a) => (
                  <option key={a.code} value={a.code} style={{ background: "#12151B" }}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </HStack>
            <HStack>
              <Button leftIcon={<LuUpload size={15} />} variant="outline" onClick={importModal.onOpen}>
                Excel/CSV import
              </Button>
              <Button leftIcon={<LuPlus size={15} />} onClick={openCreate}>
                Yangi ishtirokchi
              </Button>
            </HStack>
          </Flex>

          {loading ? (
            <Flex justify="center" py={12}>
              <Spinner color="gold.400" size="lg" />
            </Flex>
          ) : (
            <ParticipantTable
              participants={filtered}
              selectedId={selected?.id || ""}
              onSelect={setSelected}
              onEdit={openEdit}
              onToggleBlock={toggleBlock}
              onPrint={printBadge}
            />
          )}
        </Box>

        {selected && (
          <ParticipantPreview
            participant={selected}
            onPrint={() => printBadge(selected)}
            onEdit={() => openEdit(selected)}
            onToggleBlock={() => toggleBlock(selected)}
            onOpenHistory={() => openHistory(selected)}
          />
        )}
      </Flex>

      {printTarget && (
        <Box id="printable-badge">
          <BadgeCard participant={printTarget} />
        </Box>
      )}

      {selected && (
        <ParticipantHistoryDrawer
          isOpen={historyDrawer.isOpen}
          onClose={historyDrawer.onClose}
          participant={selected}
          history={participantHistory}
        />
      )}

      <ParticipantFormModal
        isOpen={formModal.isOpen}
        onClose={formModal.onClose}
        onSave={saveParticipant}
        initial={editing}
      />

      <ImportModal
        isOpen={importModal.isOpen}
        onClose={importModal.onClose}
        onImportSuccess={loadData}
      />
    </Box>
  );
}
