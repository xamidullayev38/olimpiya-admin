import { useState, useRef, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import { Participant, AccreditationCode, AccreditationType } from "@/shared/types";
import { fetchAccreditationTypes } from "@/shared/api/services";

export function ParticipantFormModal({
  isOpen,
  onClose,
  onSave,
  initial,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fields: {
    fullName: string;
    docNumber: string;
    phone: string;
    organization: string;
    accreditation: AccreditationCode;
    sport?: string;
  }) => void;
  initial: Participant | null;
}) {
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [docNumber, setDocNumber] = useState(initial?.docNumber ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [organization, setOrganization] = useState(initial?.organization ?? "");
  const [accreditation, setAccreditation] = useState<AccreditationCode>(initial?.accreditation ?? "ATH");
  const [sport, setSport] = useState(initial?.sport ?? "");
  const [types, setTypes] = useState<AccreditationType[]>([]);

  useEffect(() => {
    async function loadTypes() {
      const data = await fetchAccreditationTypes();
      setTypes(data);
    }
    if (isOpen) loadTypes();
  }, [isOpen]);

  const lastInitialId = useRef<string | null>(null);
  if (isOpen && initial?.id !== lastInitialId.current) {
    lastInitialId.current = initial?.id ?? null;
    if (initial) {
      setFullName(initial.fullName);
      setDocNumber(initial.docNumber);
      setPhone(initial.phone);
      setOrganization(initial.organization);
      setAccreditation(initial.accreditation);
      setSport(initial.sport ?? "");
    } else {
      setFullName("");
      setDocNumber("");
      setPhone("");
      setOrganization("");
      setAccreditation("ATH");
      setSport("");
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent className="glass-panel">
        <ModalHeader color="ink.900">
          {initial ? "Ishtirokchini tahrirlash" : "Yangi ishtirokchi qo'shish"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel fontSize="13px" color="ink.500">F.I.Sh</FormLabel>
              <Input variant="outline" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="masalan: Aziz Karimov" />
            </FormControl>
            <HStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="13px" color="ink.500">Hujjat raqami</FormLabel>
                <Input variant="outline" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} placeholder="AB1234567" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="13px" color="ink.500">Telefon</FormLabel>
                <Input variant="outline" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" />
              </FormControl>
            </HStack>
            <FormControl>
              <FormLabel fontSize="13px" color="ink.500">Tashkilot / Hudud</FormLabel>
              <Input variant="outline" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="masalan: Toshkent viloyati" />
            </FormControl>
            <HStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="13px" color="ink.500">Akkreditatsiya turi</FormLabel>
                <Select variant="outline" value={accreditation} onChange={(e) => setAccreditation(e.target.value as AccreditationCode)}>
                  {types.length > 0 ? (
                    types.map((a) => (
                      <option key={a.code} value={a.code} style={{ background: "#12151B" }}>{a.name}</option>
                    ))
                  ) : (
                    <option value="ATH" style={{ background: "#12151B" }}>Sportchi</option>
                  )}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="13px" color="ink.500">Sport turi (ixtiyoriy)</FormLabel>
                <Input variant="outline" value={sport} onChange={(e) => setSport(e.target.value)} placeholder="masalan: Boks" />
              </FormControl>
            </HStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Bekor qilish
          </Button>
          <Button
            onClick={() =>
              onSave({ fullName, docNumber, phone, organization, accreditation, sport: sport || undefined })
            }
          >
            Saqlash
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
