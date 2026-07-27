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
  Text,
  Input,
  FormControl,
  FormLabel,
  Badge,
  Avatar,
  Box,
  Divider,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuUser, LuKey } from "react-icons/lu";
import { UserProfile, getStoredUser } from "@/lib/auth";
import { apiClient, storeAuthTokens, setCookie, SESSION_USER_KEY } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { Alert, AlertIcon } from "@chakra-ui/react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile;
}

export function ProfileModal({ isOpen, onClose, user: propUser }: ProfileModalProps) {
  const user = propUser || getStoredUser();
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setTabIndex(user.mustChangePassword ? 1 : 0);
    }
  }, [isOpen, user.mustChangePassword]);

  function handleCloseModal() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onClose();
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "purple";
      case "ZONE_MANAGER":
        return "blue";
      case "OPERATOR":
        return "green";
      case "ANALYST":
        return "orange";
      default:
        return "gray";
    }
  };

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast({
        title: "Xatolik",
        description: "Barcha maydonlarni to'ldiring",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Xatolik",
        description: "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Xatolik",
        description: "Yangi parollar mos kelmadi",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const res: any = await apiClient(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        method: "POST",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (res && res.accessToken) {
        storeAuthTokens(res.accessToken, res.refreshToken, res.user);
      } else {
        const updatedUser = { ...user, mustChangePassword: false };
        setCookie(SESSION_USER_KEY, JSON.stringify(updatedUser), 7);
      }

      toast({
        title: "Muvaffaqiyatli",
        description: "Parolingiz muvaffaqiyatli o'zgartirildi",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err: any) {
      toast({
        title: "Xatolik",
        description: err.message || "Parolni o'zgartirishda xatolik yuz berdi",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  const defaultTabIndex = user.mustChangePassword ? 1 : 0;

  return (
    <Modal isOpen={isOpen} onClose={user.mustChangePassword ? () => {} : handleCloseModal} isCentered size="md">
      <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.700" />
      <ModalContent bg="canvas.800" border="1px solid" borderColor="line.900" color="ink.900">
        <ModalHeader borderBottom="1px solid" borderColor="line.900" py={4}>
          <HStack spacing={2}>
            <LuUser size={20} color="#E2A93B" />
            <Text fontSize="17px" fontWeight="600">Shaxsiy Profil va Xavfsizlik</Text>
          </HStack>
        </ModalHeader>
        {!user.mustChangePassword && <ModalCloseButton onClick={handleCloseModal} />}

        <ModalBody py={5}>
          {user.mustChangePassword && (
            <Alert status="warning" borderRadius="lg" mb={4} bg="rgba(232, 162, 61, 0.15)" border="1px solid" borderColor="rgba(232, 162, 61, 0.3)" color="signal.amber">
              <AlertIcon />
              Xavfsizlik talabi: Birinchi kirishda vaqtinchalik parolingizni yangilashingiz shart!
            </Alert>
          )}

          <Tabs variant="soft-rounded" colorScheme="yellow" index={tabIndex} onChange={(i) => setTabIndex(i)}>
            <TabList mb={4} bg="surface.800" p={1} borderRadius="lg">
              <Tab fontSize="13px" _selected={{ bg: "gold.400", color: "canvas.900" }}>
                <HStack spacing={1.5}>
                  <LuUser size={15} />
                  <Text>Ma'lumotlar</Text>
                </HStack>
              </Tab>
              <Tab fontSize="13px" _selected={{ bg: "gold.400", color: "canvas.900" }}>
                <HStack spacing={1.5}>
                  <LuKey size={15} />
                  <Text>Parolni o'zgartirish</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Tab 1: Profile Info */}
              <TabPanel px={0} py={2}>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={4} bg="surface.800" p={4} borderRadius="xl" border="1px solid" borderColor="line.900">
                    <Avatar size="lg" name={user.fullName} bg="gold.400" color="canvas.900" />
                    <VStack align="start" spacing={1}>
                      <Text fontSize="16px" fontWeight="700" color="ink.900">
                        {user.fullName}
                      </Text>
                      <Text fontSize="13px" color="ink.500">
                        @{user.username}
                      </Text>
                      <HStack spacing={1} pt={1}>
                        {user.roles?.map((role) => (
                          <Badge key={role} colorScheme={getRoleBadgeColor(role)} px={2} py={0.5} borderRadius="md" fontSize="11px">
                            {role}
                          </Badge>
                        ))}
                      </HStack>
                    </VStack>
                  </HStack>

                  <Box bg="surface.800" p={4} borderRadius="xl" border="1px solid" borderColor="line.900">
                    <VStack align="stretch" spacing={3} fontSize="13px">
                      <HStack justify="space-between">
                        <Text color="ink.500">Tizimdagi ID:</Text>
                        <Text color="ink.900" fontFamily="mono">{user.id || "Noma'lum"}</Text>
                      </HStack>
                      <Divider borderColor="line.900" />
                      <HStack justify="space-between">
                        <Text color="ink.500">Email:</Text>
                        <Text color="ink.900">{user.email || "Kiritilmagan"}</Text>
                      </HStack>
                      <Divider borderColor="line.900" />
                      <HStack justify="space-between">
                        <Text color="ink.500">Huquqlar (Permissions):</Text>
                        <HStack spacing={1} flexWrap="wrap" justify="flex-end">
                          {user.permissions?.includes("*") ? (
                            <Badge colorScheme="purple" fontSize="10px">Barcha huquqlar (*)</Badge>
                          ) : (
                            user.permissions?.slice(0, 3).map((p) => (
                              <Badge key={p} colorScheme="gray" fontSize="10px">{p}</Badge>
                            ))
                          )}
                        </HStack>
                      </HStack>
                    </VStack>
                  </Box>
                </VStack>
              </TabPanel>

              {/* Tab 2: Change Password */}
              <TabPanel px={0} py={2}>
                <form onSubmit={handleChangePassword}>
                  <VStack spacing={4} align="stretch">
                    <FormControl isRequired>
                      <FormLabel fontSize="13px" color="ink.700">Joriy parol</FormLabel>
                      <Input
                        type="password"
                        placeholder="Joriy parolingizni kiriting"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        bg="surface.800"
                        borderColor="line.900"
                        _focus={{ borderColor: "gold.400" }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize="13px" color="ink.700">Yangi parol</FormLabel>
                      <Input
                        type="password"
                        placeholder="Kamida 6 ta belgi"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        bg="surface.800"
                        borderColor="line.900"
                        _focus={{ borderColor: "gold.400" }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize="13px" color="ink.700">Yangi parolni takrorlang</FormLabel>
                      <Input
                        type="password"
                        placeholder="Yangi parolni qayta kiriting"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        bg="surface.800"
                        borderColor="line.900"
                        _focus={{ borderColor: "gold.400" }}
                      />
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="yellow"
                      bg="gold.400"
                      color="canvas.900"
                      _hover={{ bg: "gold.500" }}
                      isLoading={loading}
                      mt={2}
                      w="full"
                    >
                      Parolni yangilash
                    </Button>
                  </VStack>
                </form>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor="line.900" py={3}>
          <Button variant="ghost" size="sm" onClick={handleCloseModal}>
            Yopish
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
