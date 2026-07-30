"use client";

import {
  Box,
  Flex,
  Text,
  VStack,
  Button,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import Topbar from "@/widgets/Topbar/ui/Topbar";
import { getCookie } from "@/shared/lib/cookies";

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
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
        const token = getCookie("staff_token"); // Admin JWT
        const res = await fetch("http://localhost:3000/v1/scan/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ qrToken: decodedText }),
        });
        
        const data = await res.json();
        setScanResult(data);
        
        if (data.valid) {
          toast({
            title: "Muvaffaqiyatli!",
            description: data.participant?.fullName + " tasdiqlandi.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else {
          toast({
            title: "Xatolik!",
            description: data.reason || "QR kod yaroqsiz",
            status: "error",
            duration: 4000,
            isClosable: true,
          });
        }
      } catch (err) {
        toast({
          title: "Xatolik",
          description: "Server bilan bog'lanishda xatolik yuz berdi",
          status: "error",
          duration: 3000,
        });
      } finally {
        setTimeout(() => {
          setLoading(false);
          setScanResult(null);
          scanner.resume();
        }, 3000);
      }
    }

    function onScanFailure(error: any) {
      // Ignore background scanning errors
    }

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear html5QrcodeScanner. ", error));
    };
  }, []);

  return (
    <Box>
      <Topbar title="QR Skaner" subtitle="Kamera orqali bejiklarni tekshirish" />
      <Box px={8} py={6} maxW="600px" mx="auto">
        <Box
          bg="surface.800"
          border="1px solid"
          borderColor="line.900"
          borderRadius="lg"
          p={5}
          textAlign="center"
        >
          <div id="reader" style={{ width: "100%" }}></div>

          {scanResult && (
            <VStack mt={6} spacing={3} p={4} bg={scanResult.valid ? "rgba(63, 182, 127, 0.1)" : "rgba(229, 72, 77, 0.1)"} borderRadius="md">
              <Text fontSize="lg" fontWeight="bold" color={scanResult.valid ? "#3FB67F" : "#E5484D"}>
                {scanResult.valid ? "RUXSAT BERILGAN" : "RAD ETILGAN"}
              </Text>
              
              {scanResult.participant && (
                <>
                  <Text fontSize="md" color="ink.900">
                    {scanResult.participant.fullName}
                  </Text>
                  <Text fontSize="sm" color="ink.500">
                    {scanResult.participant.category}
                  </Text>
                </>
              )}
              
              {!scanResult.valid && (
                <Text fontSize="sm" color="#E5484D">
                  Sabab: {scanResult.reason}
                </Text>
              )}
            </VStack>
          )}
        </Box>
      </Box>
    </Box>
  );
}
