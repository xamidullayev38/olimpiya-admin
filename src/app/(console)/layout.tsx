import { Flex, Box } from "@chakra-ui/react";
import Sidebar from "@/widgets/Sidebar/ui/Sidebar";

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Flex minH="100vh" bg="canvas.800">
      <Sidebar />
      <Box flex={1} minW={0}>
        {children}
      </Box>
    </Flex>
  );
}

