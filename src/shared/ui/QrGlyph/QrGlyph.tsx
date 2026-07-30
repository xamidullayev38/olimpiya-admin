"use client";

import QRCode from "react-qr-code";
import {
  Box,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

export default function QrGlyph({
  seed,
  size = 48,
  color = "#EDEFF3",
}: {
  seed: string;
  size?: number;
  color?: string;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box
        bg="white"
        p={1} // Add a small padding (quiet zone) for better scanability
        borderRadius="md"
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        transition="transform 0.15s ease"
        _hover={{ transform: "scale(1.05)", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
        onClick={onOpen}
      >
        <QRCode
          value={seed}
          size={size - 8} // Adjust for padding
          level="M" // Medium error correction is usually enough
        />
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
        <ModalOverlay backdropFilter="blur(3px)" bg="blackAlpha.700" />
        <ModalContent bg="canvas.800" borderColor="line.900" borderWidth="1px" color="ink.900">
          <ModalHeader fontSize="md">QR kodni skanerlash</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} display="flex" justifyContent="center">
            <Box bg="white" p={4} borderRadius="xl">
              <QRCode value={seed} size={256} level="M" />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
