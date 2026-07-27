"use client";

import { Flex, Text, HStack, Avatar, VStack, Box, IconButton, Tooltip, useDisclosure } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LuLogOut, LuUser } from "react-icons/lu";
import { logout, getStoredUser, UserProfile, fetchCurrentUser } from "@/lib/auth";
import { ProfileModal } from "@/features/Profile/ui/ProfileModal";

export default function Topbar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const [now, setNow] = useState<Date | null>(null);
  const [user, setUser] = useState<UserProfile>(getStoredUser());
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    
    // Fetch latest user info from backend
    fetchCurrentUser().then((u) => {
      if (u) {
        setUser(u);
        if (u.mustChangePassword) {
          onOpen();
        }
      }
    });

    return () => clearInterval(t);
  }, []);

  const primaryRole = user.roles && user.roles.length > 0 ? user.roles[0] : "Foydalanuvchi";

  return (
    <>
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
            <Tooltip label="Shaxsiy profil va sozlamalar" placement="bottom">
              <HStack
                spacing={3}
                cursor="pointer"
                p={1.5}
                borderRadius="lg"
                _hover={{ bg: "surface.800" }}
                transition="all 0.15s ease"
                onClick={onOpen}
              >
                <Avatar size="sm" name={user.fullName} bg="gold.400" color="canvas.900" />
                <VStack spacing={0} align="start">
                  <Text fontSize="13px" fontWeight="600" color="ink.900">
                    {user.fullName}
                  </Text>
                  <Text fontSize="11px" color="ink.500">
                    {primaryRole}
                  </Text>
                </VStack>
              </HStack>
            </Tooltip>
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

      <ProfileModal isOpen={isOpen} onClose={onClose} user={user} />
    </>
  );
}

