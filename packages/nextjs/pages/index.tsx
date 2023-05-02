import { useState } from "react";
import Head from "next/head";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Container,
  Divider,
  Icon,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { MdSettings } from "react-icons/md";
import { Deposit } from "~~/components/deposit";
import { Withdraw } from "~~/components/withdraw";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

// TODO: Color variables (/color scheme)
// TODO: Componentise
// TODO: Add a QueryLoader

const Home: NextPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slippage, setSlippage] = useState(0.5);

  const { data: poolData } = useScaffoldContractRead({
    contractName: "SolidVault",
    functionName: "getReserveData",
  });
  console.log({ poolData });
  // if (isLoading) {
  //   return (
  //     <Box display="flex" alignItems="center" justifyContent="center" sx={{ minHeight: "30vh" }}>
  //       <Spinner size="xl" />
  //     </Box>
  //   );
  // }

  if (!poolData?.apy) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ minHeight: "30vh" }}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Unable to connect to Aave</AlertTitle>
          <AlertDescription>We cannot retrieve the current APY.</AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>🔮🏦SolidVault</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </Head>
      <main>
        <Container mt={10} border="1px solid" borderColor="gray.400" borderRadius={12} px={10} py={4}>
          <Tabs width="100%" colorScheme="purple">
            <TabList display="flex" justifyContent="space-between">
              <Box display="flex">
                <Tab>Deposit</Tab>
                <Tab>Withdraw</Tab>
              </Box>
              <Box>
                <IconButton
                  size="lg"
                  bg="transparent"
                  icon={<Icon as={MdSettings} />}
                  aria-label="Slippage"
                  onClick={() => setIsModalOpen(true)}
                />
              </Box>
            </TabList>
            <TabPanels>
              <Deposit apy={poolData[0].apy} />
              <Withdraw />
            </TabPanels>
          </Tabs>
        </Container>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Slippage %</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box display="flex" gap={2}>
                <Button colorScheme="purple" variant="outline" onClick={() => setSlippage(0.5)}>
                  0.5
                </Button>
                <Button colorScheme="purple" variant="outline" onClick={() => setSlippage(1.0)}>
                  1.0
                </Button>
              </Box>
              <Divider my={4} />
              <Input
                placeholder="Custom slippage"
                type="number"
                borderColor="purple.500"
                value={slippage}
                onChange={e => setSlippage(e.target.valueAsNumber)}
              />
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="purple" mr={3} onClick={() => setIsModalOpen(false)}>
                Apply
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </main>
    </>
  );
};

export default Home;
