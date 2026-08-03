"use client";

import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Button,
  FormControl,
  FormLabel,
  Select,
  Input,
  Badge,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { LuMapPin, LuScanLine, LuSettings, LuCheck, LuX } from "react-icons/lu";
import Topbar from "@/widgets/Topbar/ui/Topbar";
import { apiClient } from "@/shared/api/client";
import { fetchZones } from "@/shared/api/services";
import { Zone } from "@/shared/types";

export default function ScannerPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);

  // Configuration state
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [scanMode, setScanMode] = useState<"IN" | "OUT" | "MEAL" | "VERIFY">("IN");
  const [deviceKey, setDeviceKey] = useState<string>("");
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  // Scan execution state
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Load available zones on mount
  useEffect(() => {
    async function loadZones() {
      try {
        const data = await fetchZones();
        setZones(data);
        if (data.length > 0) {
          setSelectedZoneId(data[0].id || data[0].code);
        }
      } catch (e) {
        toast({ title: "Zonalarni yuklashda xatolik", status: "error" });
      } finally {
        setLoadingZones(false);
      }
    }
    loadZones();
  }, [toast]);

  // QR Scanner initialization when configured
  useEffect(() => {
    if (!isConfigured) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    async function onScanSuccess(decodedText: string) {
      if (loading) return;
      setLoading(true);
      scanner.pause(true);

      try {
        let data: any;
        if (scanMode === "MEAL") {
          data = await apiClient("/scan/meal", {
            method: "POST",
            body: JSON.stringify({ qrToken: decodedText }),
          });
        } else if (scanMode === "IN" || scanMode === "OUT") {
          data = await apiClient("/scan/access", {
            method: "POST",
            body: JSON.stringify({ qrToken: decodedText, direction: scanMode }),
          });
        } else {
          // Admin Verify mode
          data = await apiClient("/scan/verify", {
            method: "POST",
            body: JSON.stringify({ qrToken: decodedText }),
          });
        }

        const isSuccess = data.valid || data.granted;
        setScanResult(data);

        if (isSuccess) {
          toast({
            title: "Ruxsat berildi!",
            description: (data.participant?.fullName || "Ishtirokchi") + " tasdiqlandi.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else {
          toast({
            title: "Rad etildi!",
            description: data.reason || "QR kod yaroqsiz",
            status: "error",
            duration: 4000,
            isClosable: true,
          });
        }
      } catch (err: any) {
        toast({
          title: "Xatolik",
          description: err.message || "Server bilan bog'lanishda xatolik yuz berdi",
          status: "error",
          duration: 3000,
        });
      } finally {
        setTimeout(() => {
          setLoading(false);
          setScanResult(null);
          try {
            scanner.resume();
          } catch {
            // silent catch
          }
        }, 3000);
      }
    }

    function onScanFailure() {
      // Ignore background scan frame misses
    }

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [isConfigured, scanMode, loading, toast]);

  const activeZone = zones.find((z) => (z.id || z.code) === selectedZoneId);

  const getModeLabel = () => {
    switch (scanMode) {
      case "IN":
        return "Kirish Nazorati (IN)";
      case "OUT":
        return "Chiqish Nazorati (OUT)";
      case "MEAL":
        return "Ovqatlanish Nazorati (Oshxona)";
      case "VERIFY":
        return "Admin Tekshiruvi (Read-Only)";
    }
  };

  return (
    <Box>
      <Topbar title="QR Skaner" subtitle="Kamera orqali bejiklarni tekshirish va kirish nazorati" />

      <Box px={8} py={6} maxW="640px" mx="auto">
        {!isConfigured ? (
          // SETUP / ZONE SELECTION CARD
          <Box
            bg="surface.800"
            border="1px solid"
            borderColor="line.900"
            borderRadius="lg"
            p={6}
          >
            <Flex align="center" gap={3} mb={6}>
              <Flex
                w="40px"
                h="40px"
                bg="canvas.900"
                borderRadius="md"
                align="center"
                justify="center"
                mr={3}
                border="1px solid"
                borderColor="line.900"
              >
                <LuSettings size={20} color="#D4A853" />
              </Flex>
              <Box>
                <Text fontSize="16px" fontWeight="600" color="ink.900">
                  Qurilma va Zonani Biriktirish
                </Text>
                <Text fontSize="12px" color="ink.500">
                  Skanerlashni boshlashdan oldin zonangizni va rejimingizni tanlang
                </Text>
              </Box>
            </Flex>

            {loadingZones ? (
              <Flex justify="center" py={8}>
                <Spinner color="gold.400" size="md" />
              </Flex>
            ) : (
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="13px" color="ink.500">
                    Biriktiriladigan zona
                  </FormLabel>
                  <Select
                    bg="canvas.900"
                    borderColor="line.800"
                    value={selectedZoneId}
                    onChange={(e) => setSelectedZoneId(e.target.value)}
                  >
                    {zones.map((z) => (
                      <option key={z.id || z.code} value={z.id || z.code}>
                        {z.name} ({z.code})
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="13px" color="ink.500">
                    Skanerlash rejimi
                  </FormLabel>
                  <Select
                    bg="canvas.900"
                    borderColor="line.800"
                    value={scanMode}
                    onChange={(e) => setScanMode(e.target.value as any)}
                  >
                    <option value="IN">Kirish nazorati (IN)</option>
                    <option value="OUT">Chiqish nazorati (OUT)</option>
                    <option value="MEAL">Ovqatlanish nazorati (Oshxona)</option>
                    <option value="VERIFY">Faqat tekshirish (Admin Read-Only)</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="13px" color="ink.500">
                    Qurilma paroli / Device Key (ixtiyoriy)
                  </FormLabel>
                  <Input
                    type="password"
                    bg="canvas.900"
                    borderColor="line.800"
                    placeholder="masalan: SCANNER-SECRET-KEY"
                    value={deviceKey}
                    onChange={(e) => setDeviceKey(e.target.value)}
                  />
                </FormControl>

                <Button
                  mt={2}
                  leftIcon={<LuScanLine size={16} />}
                  onClick={() => setIsConfigured(true)}
                  isDisabled={!selectedZoneId}
                >
                  Skanerlashni boshlash
                </Button>
              </VStack>
            )}
          </Box>
        ) : (
          // ACTIVE SCANNER UI
          <VStack spacing={4} align="stretch">
            {/* Active Zone Status Header */}
            <Box
              bg="surface.800"
              border="1px solid"
              borderColor="line.900"
              borderRadius="lg"
              p={4}
            >
              <Flex justify="space-between" align="center">
                <HStack spacing={3}>
                  <Flex
                    w="36px"
                    h="36px"
                    bg="canvas.900"
                    border="1px solid"
                    borderColor="line.900"
                    borderRadius="7px"
                    align="center"
                    justify="center"
                  >
                    <LuMapPin size={18} color="#D4A853" />
                  </Flex>
                  <VStack spacing={0} align="start">
                    <HStack>
                      <Text fontWeight="600" fontSize="14px" color="ink.900">
                        {activeZone?.name || "Zona"}
                      </Text>
                      <Badge colorScheme="gold" fontSize="10px" px={2}>
                        {activeZone?.code}
                      </Badge>
                    </HStack>
                    <Text fontSize="12px" color="ink.500">
                      Rejim: <Text as="span" color="ink.900" fontWeight="500">{getModeLabel()}</Text>
                    </Text>
                  </VStack>
                </HStack>

                <Button
                  size="xs"
                  variant="outline"
                  leftIcon={<LuSettings size={13} />}
                  onClick={() => setIsConfigured(false)}
                >
                  Zonani o&apos;zgartirish
                </Button>
              </Flex>
            </Box>

            {/* Camera View Area */}
            <Box
              bg="surface.800"
              border="1px solid"
              borderColor="line.900"
              borderRadius="lg"
              p={5}
              textAlign="center"
            >
              <div id="reader" style={{ width: "100%" }}></div>

              {/* Scan Result Feedback Card */}
              {scanResult && (
                <VStack
                  mt={6}
                  spacing={3}
                  p={5}
                  borderRadius="lg"
                  bg={
                    scanResult.valid || scanResult.granted
                      ? "rgba(63, 182, 127, 0.12)"
                      : "rgba(229, 72, 77, 0.12)"
                  }
                  border="1px solid"
                  borderColor={
                    scanResult.valid || scanResult.granted
                      ? "rgba(63, 182, 127, 0.3)"
                      : "rgba(229, 72, 77, 0.3)"
                  }
                >
                  <Flex align="center" justify="center" gap={2}>
                    {scanResult.valid || scanResult.granted ? (
                      <LuCheck size={24} color="#3FB67F" />
                    ) : (
                      <LuX size={24} color="#E5484D" />
                    )}
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      color={
                        scanResult.valid || scanResult.granted ? "#3FB67F" : "#E5484D"
                      }
                    >
                      {scanResult.valid || scanResult.granted
                        ? "RUXSAT BERILDI"
                        : "RAD ETILDI"}
                    </Text>
                  </Flex>

                  {scanResult.participant && (
                    <VStack spacing={1}>
                      <Text fontSize="md" fontWeight="600" color="ink.900">
                        {scanResult.participant.fullName}
                      </Text>
                      {scanResult.participant.category && (
                        <Badge colorScheme="blue">
                          {scanResult.participant.category}
                        </Badge>
                      )}
                    </VStack>
                  )}

                  {scanResult.reason && (
                    <Text fontSize="sm" color="#E5484D" fontWeight="500">
                      Sabab: {scanResult.reason}
                    </Text>
                  )}
                </VStack>
              )}
            </Box>
          </VStack>
        )}
      </Box>
    </Box>
  );
}
