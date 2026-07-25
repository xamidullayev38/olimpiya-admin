"use client";

import {
  Box,
  HStack,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import { LuShieldCheck, LuUsers, LuTags, LuHistory } from "react-icons/lu";
import Topbar from "@/widgets/Topbar/ui/Topbar";
import { RolesPanel } from "@/features/RBAC/ManageRoles/ui/RolesPanel";
import { UsersPanel } from "@/features/RBAC/ManageUsers/ui/UsersPanel";
import { AccreditationTypesPanel } from "@/features/RBAC/ManageAccreditationTypes/ui/AccreditationTypesPanel";
import { AuditLogPanel } from "@/features/RBAC/ViewAuditLog/ui/AuditLogPanel";

export function SettingsPage() {
  return (
    <Box>
      <Topbar
        title="Sozlamalar"
        subtitle="Rollar, tizim foydalanuvchilari, akkreditatsiya turlari va audit log"
      />
      <Box px={8} py={6}>
        <Tabs variant="unstyled">
          <TabList
            bg="surface.800"
            border="1px solid"
            borderColor="line.900"
            borderRadius="md"
            p={1}
            w="fit-content"
            mb={5}
            flexWrap="wrap"
            className="glass-panel"
            style={{background: 'rgba(27, 32, 40, 0.4)'}}
          >
            {[
              { label: "Rollar va ruxsatlar", icon: LuShieldCheck },
              { label: "Tizim foydalanuvchilari", icon: LuUsers },
              { label: "Akkreditatsiya turlari", icon: LuTags },
              { label: "Audit log", icon: LuHistory },
            ].map(({ label, icon: Icon }) => (
              <Tab
                key={label}
                fontSize="13px"
                px={4}
                py={2}
                borderRadius="6px"
                color="ink.500"
                _selected={{ bg: "gold.400", color: "canvas.900", fontWeight: "600" }}
              >
                <HStack spacing={1.5}>
                  <Icon size={14} />
                  <Text>{label}</Text>
                </HStack>
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <RolesPanel />
            </TabPanel>
            <TabPanel p={0}>
              <UsersPanel />
            </TabPanel>
            <TabPanel p={0}>
              <AccreditationTypesPanel />
            </TabPanel>
            <TabPanel p={0}>
              <AuditLogPanel />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
}
