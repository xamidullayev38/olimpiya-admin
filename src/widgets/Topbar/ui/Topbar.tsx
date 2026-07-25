"use client";

import { Flex, Text, HStack, Avatar, VStack, Box, IconButton, Tooltip } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LuLogOut } from "react-icons/lu";
import { logout } from "@/lib/auth";

export default function Topbar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const [now, setNow] = useState<Date | null>(null);
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      px={8}
      h="72px"
      borderBottom="1px solid"
      borderColor="line.900"
      bg="canvas.800"
      position="sticky"
      top={0}
      zIndex={5}
    >
      <VStack align="start" spacing={0}>
        <Text fontFamily="heading" fontSize="19px" fontWeight="600" color="ink.900">
          {title}
        </Text>
        {subtitle && (
          <Text fontSize="13px" color="ink.500">
            {subtitle}
          </Text>
        )}
      </VStack>

      <HStack spacing={6}>
        <VStack spacing={0} align="end">
          <Text fontFamily="mono" fontSize="13px" color="ink.700" minW="76px" textAlign="right">
            {now ? now.toLocaleTimeString("uz-UZ", { hour12: false }) : "--:--:--"}
          </Text>
          <Text fontSize="11px" color="ink.300">
            Musobaqa kuni · 1
          </Text>
        </VStack>
        <Box w="1px" h="30px" bg="line.900" />
        <HStack spacing={3}>
          <Avatar size="sm" name="Alisher Nazarov" bg="gold.400" color="canvas.900" />
          <VStack spacing={0} align="start">
            <Text fontSize="13px" fontWeight="600" color="ink.900">
              Alisher Nazarov
            </Text>
            <Text fontSize="11px" color="ink.500">
              Super Admin
            </Text>
          </VStack>
          <Tooltip label="Chiqish" placement="bottom">
            <IconButton
              aria-label="Chiqish"
              icon={<LuLogOut size={16} />}
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            />
          </Tooltip>
        </HStack>
      </HStack>
    </Flex>
  );
}
