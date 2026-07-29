"use client";

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
  Flex,
  Text,
  Box,
  Badge,
  useToast,
  Link,
  Icon,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { LuUpload, LuFileSpreadsheet, LuFileCheck, LuX, LuDownload } from "react-icons/lu";
import { importParticipantsApi } from "@/shared/api/services";

export function ImportModal({
  isOpen,
  onClose,
  onImportSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const toast = useToast();

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  }

  function validateAndSetFile(selectedFile: File) {
    const lowerName = selectedFile.name.toLowerCase();
    if (!lowerName.endsWith(".xlsx") && !lowerName.endsWith(".xls") && !lowerName.endsWith(".csv")) {
      toast({
        title: "Noto'g'ri fayl formati",
        description: "Faqat Excel (.xlsx, .xls) yoki CSV (.csv) fayllarini yuklashingiz mumkin",
        status: "warning",
        duration: 3500,
        isClosable: true,
      });
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "Fayl hajmi juda katta",
        description: "Fayl hajmi 5MB dan oshmasligi kerak",
        status: "warning",
        duration: 3500,
        isClosable: true,
      });
      return;
    }
    setFile(selectedFile);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }

  function handleRemoveFile() {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleImport() {
    if (!file) {
      toast({
        title: "Fayl tanlanmagan",
        description: "Iltimos, import qilish uchun Excel yoki CSV faylini tanlang",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await importParticipantsApi(file);
      const successCount = res.successCount ?? 0;
      const errorCount = res.errorCount ?? 0;
      toast({
        title: errorCount === 0 ? "Import muvaffaqiyatli yakunlandi!" : "Import yakunlandi (xatolar bilan)",
        description: errorCount === 0
          ? `${successCount} ta ishtirokchi muvaffaqiyatli import qilindi.`
          : `${successCount} ta muvaffaqiyatli, ${errorCount} ta xato.`,
        status: errorCount === 0 ? "success" : "warning",
        duration: 5000,
        isClosable: true,
      });
      handleCloseModal();
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err: any) {
      toast({
        title: "Import qilishda xatolik",
        description: err.message || "Fayl ichidagi ma'lumotlar formatida xatolik aniqlandi",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  function handleCloseModal() {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} isCentered size="lg">
      <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.700" />
      <ModalContent bg="canvas.800" border="1px solid" borderColor="line.900" color="ink.900" borderRadius="xl">
        <ModalHeader borderBottom="1px solid" borderColor="line.900" py={4}>
          <HStack spacing={2.5}>
            <Flex w="32px" h="32px" borderRadius="lg" bg="rgba(212, 168, 83, 0.12)" align="center" justify="center" border="1px solid" borderColor="rgba(212, 168, 83, 0.3)">
              <LuFileSpreadsheet size={18} color="#D4A853" />
            </Flex>
            <VStack align="start" spacing={0}>
              <Text fontSize="16px" fontWeight="600" color="ink.900">
                Ommaviy ishtirokchilarni import qilish
              </Text>
              <Text fontSize="12px" color="ink.500" fontWeight="normal">
                Excel (.xlsx) yoki CSV (.csv) fayl orqali ishtirokchilar ro'yxatini yuklang
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={6}>
          <VStack spacing={5} align="stretch">
            {/* Download Template Bar */}
            <Flex
              justify="space-between"
              align="center"
              p={3}
              bg="surface.800"
              border="1px solid"
              borderColor="line.900"
              borderRadius="lg"
            >
              <HStack spacing={2.5}>
                <LuFileCheck size={16} color="#3FB67F" />
                <Text fontSize="13px" color="ink.700">
                  Import uchun standart ustunlar namunasi
                </Text>
              </HStack>
              <Button
                as="a"
                href="/ishtirokchilar_import_namuna.xlsx"
                download="ishtirokchilar_import_namuna.xlsx"
                size="xs"
                variant="outline"
                borderColor="gold.400"
                color="gold.400"
                _hover={{ bg: "rgba(212, 168, 83, 0.1)" }}
                leftIcon={<LuDownload size={13} />}
              >
                Namunani yuklab olish
              </Button>
            </Flex>

            {/* Custom Drag and Drop Area */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".xlsx,.xls,.csv"
              style={{ display: "none" }}
            />

            {!file ? (
              <Box
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                p={8}
                borderRadius="xl"
                border="2px dashed"
                borderColor={isDragging ? "gold.400" : "line.800"}
                bg={isDragging ? "rgba(212, 168, 83, 0.06)" : "surface.800"}
                cursor="pointer"
                transition="all 0.2s ease"
                _hover={{
                  borderColor: "gold.400",
                  bg: "rgba(212, 168, 83, 0.04)",
                  transform: "translateY(-1px)",
                }}
                textAlign="center"
              >
                <VStack spacing={3}>
                  <Flex
                    w="52px"
                    h="52px"
                    borderRadius="full"
                    bg="rgba(212, 168, 83, 0.1)"
                    align="center"
                    justify="center"
                    border="1px solid"
                    borderColor="rgba(212, 168, 83, 0.2)"
                  >
                    <LuUpload size={26} color="#D4A853" />
                  </Flex>
                  <VStack spacing={1}>
                    <Text fontSize="14px" fontWeight="600" color="ink.900">
                      Faylni sudrab keling yoki <Text as="span" color="gold.400" textDecoration="underline">kompyuterdan tanlang</Text>
                    </Text>
                    <Text fontSize="12px" color="ink.500">
                      Qabul qilinadigan formatlar: .XLSX, .XLS, .CSV (maksimal 5MB)
                    </Text>
                  </VStack>
                </VStack>
              </Box>
            ) : (
              /* Selected File Card */
              <Box
                p={4}
                borderRadius="xl"
                bg="rgba(63, 182, 127, 0.05)"
                border="1px solid"
                borderColor="rgba(63, 182, 127, 0.3)"
              >
                <Flex justify="space-between" align="center">
                  <HStack spacing={3}>
                    <Flex
                      w="40px"
                      h="40px"
                      borderRadius="lg"
                      bg="signal.greenDim"
                      align="center"
                      justify="center"
                    >
                      <LuFileSpreadsheet size={20} color="#3FB67F" />
                    </Flex>
                    <VStack align="start" spacing={0.5}>
                      <HStack spacing={2}>
                        <Text fontSize="14px" fontWeight="600" color="ink.900" wordBreak="break-all">
                          {file.name}
                        </Text>
                        <Badge colorScheme="green" fontSize="10px" px={2} py={0.5} borderRadius="md">
                          {file.name.split(".").pop()?.toUpperCase()}
                        </Badge>
                      </HStack>
                      <Text fontSize="12px" color="ink.500">
                        Hajmi: {formatFileSize(file.size)}
                      </Text>
                    </VStack>
                  </HStack>

                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={handleRemoveFile}
                    p={2}
                    title="Faylni o'chirish"
                  >
                    <LuX size={18} />
                  </Button>
                </Flex>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor="line.900" py={3}>
          <Button variant="ghost" size="sm" mr={3} onClick={handleCloseModal} isDisabled={loading}>
            Bekor qilish
          </Button>
          <Button
            colorScheme="yellow"
            bg="gold.400"
            color="canvas.900"
            _hover={{ bg: "gold.500" }}
            size="sm"
            px={5}
            onClick={handleImport}
            isLoading={loading}
            loadingText="Import qilinmoqda..."
            isDisabled={!file}
          >
            Import qilish
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
