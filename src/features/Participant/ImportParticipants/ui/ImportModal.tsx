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
  Text,
  Input,
} from "@chakra-ui/react";

export function ImportModal({
  isOpen,
  onClose,
  onImport,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImport: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent className="glass-panel">
        <ModalHeader color="ink.900">Excel/CSV orqali ommaviy import</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <Text fontSize="13px" color="ink.500">
              Faylni tanlang — ustunlar: F.I.Sh, hujjat raqami, telefon, tashkilot, akkreditatsiya turi.
              Backend ulanganda bu fayl <code>POST /api/participants/import</code> ga yuboriladi.
            </Text>
            <Input type="file" accept=".csv,.xlsx" bg="canvas.900" borderColor="line.800" p={1.5} />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Bekor qilish
          </Button>
          <Button onClick={onImport}>Import qilish</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
