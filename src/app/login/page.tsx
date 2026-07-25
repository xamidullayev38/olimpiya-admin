"use client";

import {
  Flex,
  VStack,
  HStack,
  Box,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  Divider,
  PinInput,
  PinInputField,
} from "@chakra-ui/react";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LuScanLine, LuLock, LuUserRound } from "react-icons/lu";
import BadgeCard from "@/entities/Participant/ui/BadgeCard";
import { participants, liveStats } from "@/shared/api/mock-data";
import { login } from "@/lib/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"password" | "pin">("password");
  const [username, setUsername] = useState("operator.tashkent");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "password" && username.trim() === "") {
      setError("Foydalanuvchi nomini kiriting");
      return;
    }
    // TODO: backend tayyor bo'lganda shu yerni POST /api/auth/login ga ulang
    login(username || "operator");
    const from = searchParams?.get("from");
    router.push(from && from !== "/login" ? from : "/dashboard");
  }

  return (
    <Flex minH="100vh" bg="canvas.900">
      {/* Left: operational context panel */}
      <Flex
        flex="1.15"
        direction="column"
        justify="space-between"
        px={16}
        py={12}
        display={{ base: "none", lg: "flex" }}
        borderRight="1px solid"
        borderColor="line.900"
        position="relative"
        overflow="hidden"
      >
        <HStack spacing={2.5}>
          <Flex w="34px" h="34px" bg="gold.400" borderRadius="7px" align="center" justify="center">
            <LuScanLine color="#12151B" size={18} />
          </Flex>
          <Text fontFamily="heading" fontWeight="700" fontSize="16px" color="ink.900">
            QR Badge Tizimi
          </Text>
        </HStack>

        <VStack align="start" spacing={5} maxW="480px">
          <Text
            fontFamily="mono"
            fontSize="11px"
            letterSpacing="0.12em"
            color="gold.400"
          >
            AKKREDITATSIYA · ZONA NAZORATI · OVQATLANISH
          </Text>
          <Text fontFamily="heading" fontSize="34px" fontWeight="600" color="ink.900" lineHeight="1.2">
            Bitta skan. Aniq qaror. To&apos;liq nazorat.
          </Text>
          <Text fontSize="15px" color="ink.500" lineHeight="1.6">
            Har bir badge, har bir zona va har bir ovqat vaqti real vaqtda
            kuzatiladi — ruxsat berilgan yoki rad etilgan har bir urinish
            log&apos;da qoladi.
          </Text>
        </VStack>

        <HStack spacing={4} wrap="wrap">
          <BadgeCard participant={participants[0]} compact />
          <VStack align="start" spacing={3} pt={2}>
            {liveStats.slice(0, 3).map((s) => (
              <HStack key={s.zoneCode} spacing={3} fontSize="13px">
                <Box w="6px" h="6px" borderRadius="full" bg="signal.green" />
                <Text color="ink.500" minW="180px">{s.zoneName}</Text>
                <Text fontFamily="mono" color="ink.900" fontWeight="600">
                  {s.inside}
                </Text>
              </HStack>
            ))}
          </VStack>
        </HStack>
      </Flex>

      {/* Right: login form */}
      <Flex flex="1" align="center" justify="center" px={8}>
        <VStack
          as="form"
          onSubmit={handleSubmit}
          w="380px"
          bg="surface.800"
          border="1px solid"
          borderColor="line.900"
          borderRadius="lg"
          p={8}
          spacing={6}
          align="stretch"
          boxShadow="panel"
        >
          <VStack align="start" spacing={1}>
            <Text fontFamily="heading" fontSize="22px" fontWeight="600" color="ink.900">
              Tizimga kirish
            </Text>
            <Text fontSize="13px" color="ink.500">
              Operator, zona menejeri yoki admin sifatida kiring
            </Text>
          </VStack>

          <HStack bg="canvas.900" p={1} borderRadius="md" spacing={1}>
            <Button
              flex={1}
              size="sm"
              variant={mode === "password" ? "solid" : "ghost"}
              onClick={() => setMode("password")}
              type="button"
            >
              Login / parol
            </Button>
            <Button
              flex={1}
              size="sm"
              variant={mode === "pin" ? "solid" : "ghost"}
              onClick={() => setMode("pin")}
              type="button"
            >
              PIN kod
            </Button>
          </HStack>

          {mode === "password" ? (
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="13px" color="ink.500">
                  Foydalanuvchi nomi
                </FormLabel>
                <HStack
                  bg="canvas.900"
                  border="1px solid"
                  borderColor="line.800"
                  borderRadius="md"
                  px={3}
                >
                  <LuUserRound size={16} color="#5C6577" />
                  <Input
                    variant="unstyled"
                    placeholder="operator.tashkent"
                    py={2.5}
                    color="ink.900"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError(null);
                    }}
                  />
                </HStack>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="13px" color="ink.500">
                  Parol
                </FormLabel>
                <HStack
                  bg="canvas.900"
                  border="1px solid"
                  borderColor="line.800"
                  borderRadius="md"
                  px={3}
                >
                  <LuLock size={16} color="#5C6577" />
                  <Input
                    variant="unstyled"
                    type="password"
                    placeholder="••••••••"
                    py={2.5}
                    color="ink.900"
                    defaultValue="••••••••"
                  />
                </HStack>
              </FormControl>
            </VStack>
          ) : (
            <VStack spacing={3} align="center">
              <Text fontSize="13px" color="ink.500" alignSelf="start">
                4 xonali PIN kodni kiriting
              </Text>
              <HStack>
                <PinInput otp size="lg" placeholder="○">
                  <PinInputField bg="canvas.900" borderColor="line.800" color="ink.900" />
                  <PinInputField bg="canvas.900" borderColor="line.800" color="ink.900" />
                  <PinInputField bg="canvas.900" borderColor="line.800" color="ink.900" />
                  <PinInputField bg="canvas.900" borderColor="line.800" color="ink.900" />
                </PinInput>
              </HStack>
            </VStack>
          )}

          {error && (
            <Text fontSize="12px" color="signal.red">
              {error}
            </Text>
          )}
          <Button type="submit" size="lg" w="full">
            Kirish
          </Button>

          <Divider borderColor="line.900" />
          <Text fontSize="12px" color="ink.300" textAlign="center">
            Faqat oldindan ro&apos;yxatga olingan tizim xodimlari kira oladi.
          </Text>
        </VStack>
      </Flex>
    </Flex>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

