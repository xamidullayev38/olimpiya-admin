"use client";

import { Box, Flex, Text, VStack, HStack } from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import {
  LuLayoutDashboard,
  LuUsers,
  LuMapPin,
  LuUtensils,
  LuFileSpreadsheet,
  LuScanLine,
  LuShieldCheck,
} from "react-icons/lu";

const nav = [
  { href: "/dashboard", label: "Boshqaruv paneli", icon: LuLayoutDashboard },
  { href: "/participants", label: "Ishtirokchilar", icon: LuUsers },
  { href: "/zones", label: "Zonalar", icon: LuMapPin },
  { href: "/meal-tracking", label: "Ovqatlanish nazorati", icon: LuUtensils },
  { href: "/reports", label: "Hisobotlar", icon: LuFileSpreadsheet },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <Flex
      as="nav"
      direction="column"
      w="248px"
      minW="248px"
      h="100vh"
      bg="canvas.900"
      borderRight="1px solid"
      borderColor="line.900"
      py={5}
      position="sticky"
      top={0}
    >
      <HStack px={5} pb={6} spacing={2.5}>
        <Flex
          w="34px"
          h="34px"
          bg="gold.400"
          borderRadius="7px"
          align="center"
          justify="center"
          flexShrink={0}
        >
          <LuScanLine color="#12151B" size={18} />
        </Flex>
        <VStack align="start" spacing={0}>
          <Text fontFamily="heading" fontWeight="700" fontSize="15px" color="ink.900" lineHeight="1.1">
            QR Badge
          </Text>
          <Text fontSize="10px" color="ink.500" letterSpacing="0.06em">
            IBU-2026 · KONSOL
          </Text>
        </VStack>
      </HStack>

      <VStack align="stretch" spacing={0.5} px={3} flex={1}>
        {nav.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <NextLink key={item.href} href={item.href}>
              <HStack
                px={3}
                py={2.5}
                borderRadius="6px"
                spacing={3}
                bg={active ? "surface.700" : "transparent"}
                color={active ? "ink.900" : "ink.500"}
                borderLeft="2px solid"
                borderColor={active ? "gold.400" : "transparent"}
                _hover={{ bg: "surface.700", color: "ink.900" }}
                transition="all 0.12s ease"
                cursor="pointer"
              >
                <Icon size={17} />
                <Text fontSize="14px" fontWeight={active ? "600" : "500"}>
                  {item.label}
                </Text>
              </HStack>
            </NextLink>
          );
        })}
      </VStack>

      <Box px={5} pt={4} borderTop="1px solid" borderColor="line.900">
        <HStack spacing={2} color="ink.300">
          <LuShieldCheck size={14} />
          <Text fontSize="11px">Offline-first sync tayyor</Text>
        </HStack>
      </Box>
    </Flex>
  );
}
