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
} from "@chakra-ui/react";
import { useMemo, useRef, useState } from "react";
import { LuSearch, LuUpload, LuPlus } from "react-icons/lu";
import Topbar from "@/widgets/Topbar/ui/Topbar";
import { ParticipantTable } from "@/widgets/ParticipantList/ui/ParticipantTable";
import { ParticipantPreview } from "@/widgets/ParticipantList/ui/ParticipantPreview";
import { ParticipantFormModal } from "@/features/Participant/CreateParticipant/ui/ParticipantFormModal";
import { ImportModal } from "@/features/Participant/ImportParticipants/ui/ImportModal";
import { ParticipantHistoryDrawer } from "@/entities/Participant/ui/ParticipantHistoryDrawer";
import BadgeCard from "@/entities/Participant/ui/BadgeCard";
import { Participant, BadgeStatus, AccreditationCode } from "@/shared/types";
import {
  participants as initialParticipants,
  accreditationTypes,
  accessLogs,
  mealLogs,
  zoneByCode,
} from "@/shared/api/mock-data";

function pad(n: number) { return n.toString().padStart(2, "0"); }

function makeParticipant(
  fields: { fullName: string; docNumber: string; phone: string; organization: string; accreditation: AccreditationCode; sport?: string; },
  seq: number
): Participant {
  return {
    id: `P-NEW-${seq}`,
    fullName: fields.fullName,
    pinfl: `3${pad(seq)}9${pad(seq)}00000${seq % 10}`,
    birthDate: "—",
    docNumber: fields.docNumber || `AB${9000000 + seq}`,
    phone: fields.phone || "—",
    accreditation: fields.accreditation,
    sport: fields.sport,
    organization: fields.organization || "—",
    badgeStatus: "faol",
    badgeId: `BADGE-2026-N${pad(seq)}`,
    qrToken: `qrt_new_${seq}${Math.floor(Math.random() * 999)}`,
    createdAt: "2026-08-14",
  };
}

const importOrgs = ["Namangan viloyati", "Buxoro viloyati", "Xorazm viloyati"];
const importNames = ["Shoxrux Berdiyev", "Nigora Xolova", "Anvar Saidov", "Gulbahor To'rayeva", "Javlon Nematov"];

export function ParticipantsPage() {
  const [list, setList] = useState<Participant[]>(initialParticipants);
  const [query, setQuery] = useState("");
  const [accFilter, setAccFilter] = useState<string>("ALL");
  const [selected, setSelected] = useState<Participant>(initialParticipants[0]);
  const [editing, setEditing] = useState<Participant | null>(null);
  const [printTarget, setPrintTarget] = useState<Participant | null>(null);

  const historyDrawer = useDisclosure();
  const formModal = useDisclosure();
  const importModal = useDisclosure();
  const toast = useToast();
  const seqRef = useRef(1);

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

  const history = useMemo(() => {
    const access = accessLogs
      .filter((l) => l.participantId === selected.id)
      .map((l) => ({
        id: l.id,
        kind: "Zona" as const,
        label: `${zoneByCode(l.zoneCode).name} · ${l.direction}`,
        timestamp: l.timestamp,
        result: l.result,
        reason: l.reason,
      }));
    const meal = mealLogs
      .filter((l) => l.participantId === selected.id)
      .map((l) => ({
        id: l.id,
        kind: "Ovqat" as const,
        label: l.mealType,
        timestamp: l.timestamp,
        result: l.result,
        reason: l.reason,
      }));
    return [...access, ...meal].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  }, [selected.id]);

  function openCreate() {
    setEditing(null);
    formModal.onOpen();
  }

  function openEdit(p: Participant) {
    setEditing(p);
    formModal.onOpen();
  }

  function saveParticipant(fields: any) {
    if (fields.fullName.trim() === "") {
      toast({ title: "F.I.Sh kiritilishi shart", status: "warning", duration: 2500 });
      return;
    }
    if (editing) {
      const updated: Participant = { ...editing, ...fields };
      setList((prev) => prev.map((p) => (p.id === editing.id ? updated : p)));
      setSelected(updated);
      toast({ title: "Ma'lumotlar yangilandi", status: "success", duration: 2500 });
    } else {
      const p = makeParticipant(fields, seqRef.current++);
      setList((prev) => [p, ...prev]);
      setSelected(p);
      toast({
        title: "Yangi ishtirokchi qo'shildi",
        description: `${p.fullName} — QR badge avtomatik generatsiya qilindi`,
        status: "success",
        duration: 3000,
      });
    }
    formModal.onClose();
  }

  function runImport() {
    const count = 3 + Math.floor(Math.random() * 3);
    const added: Participant[] = Array.from({ length: count }).map((_, i) =>
      makeParticipant(
        {
          fullName: importNames[(seqRef.current + i) % importNames.length],
          docNumber: "",
          phone: "",
          organization: importOrgs[(seqRef.current + i) % importOrgs.length],
          accreditation: accreditationTypes[(seqRef.current + i) % accreditationTypes.length].code,
        },
        seqRef.current++
      )
    );
    setList((prev) => [...added, ...prev]);
    importModal.onClose();
    toast({
      title: "Import yakunlandi",
      description: `${added.length} ta ishtirokchi qo'shildi va badge generatsiya qilindi`,
      status: "success",
      duration: 3500,
    });
  }

  function toggleBlock(p: Participant) {
    const next: BadgeStatus = p.badgeStatus === "bloklangan" ? "faol" : "bloklangan";
    const updated = { ...p, badgeStatus: next };
    setList((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    if (selected.id === p.id) setSelected(updated);
    toast({
      title: next === "bloklangan" ? "Badge bloklandi" : "Badge blokdan chiqarildi",
      status: next === "bloklangan" ? "warning" : "success",
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
                <option value="ALL" style={{background: '#12151B'}}>Barcha turlar</option>
                {accreditationTypes.map((a) => (
                  <option key={a.code} value={a.code} style={{background: '#12151B'}}>
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

          <ParticipantTable
            participants={filtered}
            selectedId={selected.id}
            onSelect={setSelected}
            onEdit={openEdit}
            onToggleBlock={toggleBlock}
            onPrint={printBadge}
          />
        </Box>

        <ParticipantPreview
          participant={selected}
          onPrint={() => printBadge(selected)}
          onEdit={() => openEdit(selected)}
          onToggleBlock={() => toggleBlock(selected)}
          onOpenHistory={historyDrawer.onOpen}
        />
      </Flex>

      {/* Chop etishda faqat shu blok ko'rinadi (globals.css dagi @media print) */}
      {printTarget && (
        <Box id="printable-badge">
          <BadgeCard participant={printTarget} />
        </Box>
      )}

      <ParticipantHistoryDrawer
        isOpen={historyDrawer.isOpen}
        onClose={historyDrawer.onClose}
        participant={selected}
        history={history}
      />

      <ParticipantFormModal
        isOpen={formModal.isOpen}
        onClose={formModal.onClose}
        onSave={saveParticipant}
        initial={editing}
      />

      <ImportModal
        isOpen={importModal.isOpen}
        onClose={importModal.onClose}
        onImport={runImport}
      />
    </Box>
  );
}
